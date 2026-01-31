// Cloudflare environment bindings type declaration
interface CloudflareEnv {
  DB: D1Database;
  STORAGE_R2: R2Bucket;
  APP_NAME: string;
}

// Augment the @opennextjs/cloudflare module types
declare module "@opennextjs/cloudflare" {
  export function defineCloudflareConfig(config: Record<string, unknown>): Record<string, unknown>;
  
  export function getCloudflareContext(options?: { async: true }): Promise<{
    env: CloudflareEnv;
    ctx: ExecutionContext;
    cf: CfProperties;
  }>;
  export function getCloudflareContext(options?: { async?: false }): {
    env: CloudflareEnv;
    ctx: ExecutionContext;
    cf: CfProperties;
  };
}
