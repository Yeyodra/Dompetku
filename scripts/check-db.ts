import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // Check all transactions with dates
  const all = await sql`SELECT id, type, store_name, total, date FROM transactions ORDER BY date DESC`;
  console.log('All transactions:');
  all.forEach((t: any) => console.log(`  ${t.date} | ${t.type} | ${t.store_name} | Rp ${t.total}`));

  // Test summary query with January filter  
  const summary = await sql`
    SELECT type, SUM(total) as total, COUNT(*) as count 
    FROM transactions 
    WHERE date >= '2026-01-01' AND date <= '2026-01-31'
    GROUP BY type
  `;
  console.log('\nSummary for January 2026:', JSON.stringify(summary, null, 2));
}

main().catch(console.error);
