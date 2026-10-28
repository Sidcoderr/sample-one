import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

async function runMigrations() {
  const dbUrl = process.env.SUPABASE_DB_URL;

  if (!dbUrl) {
    console.error("\n==================================================================");
    console.error("⚠️  SUPABASE_DB_URL is not configured in server/.env.");
    console.error("Direct database migrations cannot run without the connection string.");
    console.error("\nTo apply migrations manually:");
    console.error("1. Open your Supabase Dashboard: https://supabase.com/dashboard");
    console.error("2. Navigate to SQL Editor");
    console.error("3. Copy & paste the contents of /supabase/migrations/001_initial_schema.sql");
    console.error("4. Click 'Run'");
    console.error("==================================================================\n");
    process.exit(1);
  }

  const migrationsDir = path.resolve(__dirname, "../../supabase/migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found at: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No .sql migration files found.");
    return;
  }

  console.log(`\nConnecting to database...`);
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected successfully.\n");

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Running migration: ${file}...`);
      const sql = fs.readFileSync(filePath, "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("COMMIT");
        console.log(`✓ Migration applied: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`✗ Error applying migration ${file}:`, err.message);
        throw err;
      }
    }

    console.log("\nAll migrations completed successfully!\n");
  } catch (err) {
    console.error("\nMigration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

runMigrations();

