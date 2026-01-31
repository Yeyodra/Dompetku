import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

async function debug() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log("=== DEBUG SUMMARY API ===\n");
  
  // 1. Check all transactions in database
  console.log("1. All transactions in database:");
  const allTx = await sql`SELECT id, user_id, type, store_name, date, total FROM transactions ORDER BY date DESC`;
  console.table(allTx);
  
  // 2. Check unique user_ids
  console.log("\n2. Unique user_ids:");
  const userIds = await sql`SELECT DISTINCT user_id FROM transactions`;
  console.table(userIds);
  
  // 3. Test date range for January 2026
  const startDate = "2026-01-01";
  const endDate = "2026-01-31";
  console.log(`\n3. Transactions in range ${startDate} to ${endDate}:`);
  const inRange = await sql`
    SELECT id, user_id, type, date, total 
    FROM transactions 
    WHERE date >= ${startDate} AND date <= ${endDate}
  `;
  console.table(inRange);
  
  // 4. Test the summary query without user filter
  console.log("\n4. Summary WITHOUT user_id filter:");
  const summaryNoUser = await sql`
    SELECT type, COALESCE(SUM(total), 0) as total, COUNT(*) as count 
    FROM transactions 
    WHERE date >= ${startDate} AND date <= ${endDate}
    GROUP BY type
  `;
  console.table(summaryNoUser);
  
  // 5. Test with a specific user_id (get first one)
  if (userIds.length > 0) {
    const testUserId = userIds[0].user_id;
    console.log(`\n5. Summary WITH user_id = '${testUserId}':`);
    const summaryWithUser = await sql`
      SELECT type, COALESCE(SUM(total), 0) as total, COUNT(*) as count 
      FROM transactions 
      WHERE user_id = ${testUserId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      GROUP BY type
    `;
    console.table(summaryWithUser);
  }
  
  // 6. Check if there's a type case sensitivity issue
  console.log("\n6. Distinct transaction types:");
  const types = await sql`SELECT DISTINCT type FROM transactions`;
  console.table(types);
}

debug().catch(console.error);
