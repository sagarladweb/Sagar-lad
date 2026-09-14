import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../../apps/site/.env") });
config({ path: resolve(__dirname, "../../apps/admin/.env") });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI operations (migrate/deploy/push) use the direct connection. Supabase's
    // pooled connection (DATABASE_URL) hangs on schema changes; the app runtime
    // still uses the pooler via packages/db/src/index.ts.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
