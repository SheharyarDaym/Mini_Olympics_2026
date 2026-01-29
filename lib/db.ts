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

export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_target, prop) {
    if (!sqlInstance) {
      sqlInstance = neon(getDatabaseUrl());
    }
    const fn = (sqlInstance as any)[prop];
    if (typeof fn === 'function') {
      return fn.bind(sqlInstance);
    }
    return fn;
  },
}) as ReturnType<typeof neon>;

// Helper function to execute queries
export async function query<T = any>(query: string, params?: any[]): Promise<T[]> {
  return await sql(query, params) as T[];
}

// Helper function to execute a single query
export async function queryOne<T = any>(query: string, params?: any[]): Promise<T | null> {
  const results = await sql(query, params) as T[];
  return results[0] || null;
}
