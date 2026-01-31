import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

async function testDashboardQuery() {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Simulate exactly what dashboard sends
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const startDate = startOfMonth.toISOString().split("T")[0];
  const endDate = endOfMonth.toISOString().split("T")[0];
  
  console.log("Dashboard sends:");
  console.log(`  startDate: ${startDate}`);
  console.log(`  endDate: ${endDate}`);
  console.log(`  now: ${now.toISOString()}`);
  console.log("");
  
  // The exact query from the API
  const userId = "user_390rXYQKCzkRmGYwmpr1Y9dOdKN";
  
  const result = await sql`
    SELECT type, COALESCE(SUM(total), 0) as total, COUNT(*) as count 
    FROM transactions 
    WHERE user_id = ${userId}
      AND date >= ${startDate}
      AND date <= ${endDate}
    GROUP BY type
  `;
  
  console.log("Query result:");
  console.table(result);
  
  // Check if dates match
  console.log("\nTransactions in that range:");
  const txs = await sql`
    SELECT date, type, total FROM transactions 
    WHERE date >= ${startDate} AND date <= ${endDate}
  `;
  console.table(txs);
}

testDashboardQuery().catch(console.error);
