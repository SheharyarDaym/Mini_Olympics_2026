import { neon } from '@neondatabase/serverless';

// Only throw error at runtime, not at build time
const getDatabaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: should not access database
    throw new Error('Database access is server-side only');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return process.env.DATABASE_URL;
};

// Lazy initialization to avoid build-time errors
let sqlInstance: ReturnType<typeof neon> | null = null;

function getSqlInstance() {
  if (!sqlInstance) {
    sqlInstance = neon(getDatabaseUrl());
  }
  return sqlInstance;
}

// Type definition for our sql function that always returns Promise<any[]>
// Supports both template literal syntax (sql`...`) and function call syntax (sql(query, params))
type SqlFunction = {
  // Template literal syntax: sql`SELECT * FROM table WHERE id = ${id}`
  (strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
  // Function call syntax: sql(query, params)
  (query: string, params?: any[]): Promise<any[]>;
  // Unsafe method for raw queries
  unsafe?: (query: string, params?: any[]) => Promise<any[]>;
};

// Create a typed wrapper that always returns Promise<any[]> for template literal queries
// This fixes TypeScript inference issues with Neon's complex return types
// The Neon library returns: any[][] | Record<string, any>[] | FullQueryResults<boolean>
// We normalize this to always be any[] for consistency
function createSqlWrapper(): SqlFunction {
  const instance = getSqlInstance();
  
  // Helper to normalize results to always be an array
  const normalizeResult = (result: any): any[] => {
    if (Array.isArray(result)) {
      return result;
    }
    return result != null ? [result] : [];
  };
  
  // Create a function that handles both template literals and function calls
  const sqlTag = ((...args: any[]): Promise<any[]> => {
    // If first argument is a TemplateStringsArray, it's a template literal call
    if (Array.isArray(args[0]) && 'raw' in args[0]) {
      const [strings, ...values] = args;
      return (instance as any)(strings, ...values).then(normalizeResult);
    }
    // Otherwise, it's a function call: sql(query, params)
    const [query, params] = args;
    return (instance as any)(query, params).then(normalizeResult);
  }) as SqlFunction;
  
  // Also support sql.unsafe(query, params) syntax
  sqlTag.unsafe = (query: string, params?: any[]): Promise<any[]> => {
    return (instance as any).unsafe(query, params).then(normalizeResult);
  };
  
  return sqlTag;
}

// Export with completely explicit type that overrides Neon's return types
// This ensures TypeScript always sees Promise<any[]> instead of the complex union type
const sqlWrapper = createSqlWrapper();

// Use a type assertion that completely replaces the inferred type
export const sql = sqlWrapper as unknown as {
  (strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
  (query: string, params?: any[]): Promise<any[]>;
  unsafe?: (query: string, params?: any[]) => Promise<any[]>;
};

// Helper function to execute queries
export async function query<T = any>(query: string, params?: any[]): Promise<T[]> {
  return await sql(query, params) as T[];
}

// Helper function to execute a single query
export async function queryOne<T = any>(query: string, params?: any[]): Promise<T | null> {
  const results = await sql(query, params) as T[];
  return results[0] || null;
}
