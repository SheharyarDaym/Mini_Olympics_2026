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

// Create a typed wrapper that always returns Promise<any[]> for template literal queries
// This fixes TypeScript inference issues with Neon's complex return types
// The Neon library returns: any[][] | Record<string, any>[] | FullQueryResults<boolean>
// We normalize this to always be any[] for consistency
function createSqlWrapper() {
  const instance = getSqlInstance();
  
  // Create a template tag function that wraps the Neon sql function
  const sqlTag = (strings: TemplateStringsArray, ...values: any[]): Promise<any[]> => {
    return (instance as any)(strings, ...values).then((result: any) => {
      // Normalize the result to always be an array
      if (Array.isArray(result)) {
        return result;
      }
      // If it's a single object or value, wrap it in an array
      return result != null ? [result] : [];
    });
  };
  
  // Also support sql(query, params) syntax
  (sqlTag as any).unsafe = (query: string, params?: any[]): Promise<any[]> => {
    return (instance as any).unsafe(query, params).then((result: any) => {
      return Array.isArray(result) ? result : (result != null ? [result] : []);
    });
  };
  
  return sqlTag;
}

export const sql = createSqlWrapper() as any;

// Helper function to execute queries
export async function query<T = any>(query: string, params?: any[]): Promise<T[]> {
  return await sql(query, params) as T[];
}

// Helper function to execute a single query
export async function queryOne<T = any>(query: string, params?: any[]): Promise<T | null> {
  const results = await sql(query, params) as T[];
  return results[0] || null;
}
