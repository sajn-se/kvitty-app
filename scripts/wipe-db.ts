import { Pool } from "pg";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your .env.local or .env file");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function wipeDatabase() {
  const client = await pool.connect();
  
  try {
    const tables = [
      "invoice_open_logs",
      "invoice_lines",
      "invoices",
      "products",
      "customers",
      "payroll_entries",
      "payroll_runs",
      "employees",
      "journal_entry_lines",
      "journal_entries",
      "bank_accounts",
      "audit_logs",
      "comments",
      "attachments",
      "bank_transactions",
      "fiscal_periods",
      "workspace_invites",
      "workspace_members",
      "workspaces",
      "verification",
      "account",
      "session",
      '"user"',
    ];

    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`Dropped table: ${table}`);
      } catch (error: any) {
        console.error(`Error dropping table ${table}:`, error.message);
      }
    }

    const enums = [
      "workspace_mode",
      "business_type",
      "journal_entry_type",
      "payroll_run_status",
      "fiscal_year_type",
      "invoice_status",
      "invoice_sent_method",
      "product_unit",
      "product_type",
      "invoice_line_type",
    ];

    for (const enumName of enums) {
      try {
        await client.query(`DROP TYPE IF EXISTS ${enumName} CASCADE`);
        console.log(`Dropped enum: ${enumName}`);
      } catch (error: any) {
        console.error(`Error dropping enum ${enumName}:`, error.message);
      }
    }

    console.log("\n✅ Database wiped successfully!");
  } catch (error) {
    console.error("Error wiping database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

wipeDatabase()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to wipe database:", error);
    process.exit(1);
  });

