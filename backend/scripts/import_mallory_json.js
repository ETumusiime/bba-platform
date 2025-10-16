// ==========================================
//  BBA Catalogue Import Script
// ==========================================
import fs from "fs";
import pg from "pg";

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "bba_db",
  password: "Alpha12345!!!!!",  // <-- use your real password
  port: 5432,
});

const data = JSON.parse(fs.readFileSync("mallory_catalogue_isbns.json", "utf8"));

const upsertSql = `
INSERT INTO books (isbn, title, edition, subject, source, source_page)
VALUES ($1,$2,$3,$4,'mallory_fy25',$5)
ON CONFLICT (isbn) DO UPDATE SET
  title       = COALESCE(EXCLUDED.title, books.title),
  edition     = COALESCE(EXCLUDED.edition, books.edition),
  subject     = COALESCE(EXCLUDED.subject, books.subject),
  source      = EXCLUDED.source,
  source_page = EXCLUDED.source_page
RETURNING id;
`;

async function run() {
  console.log("🚀 Starting Mallory import...");
  let count = 0;

  for (const r of data) {
    const isbn = (r.isbn || "").replace(/[\s-]/g, "");
    if (!isbn) continue;
    const title   = r.title_guess   || null;
    const edition = r.edition_guess || null;
    const subject = r.subject_guess || null;
    const page    = r.page || null;

    try {
      await pool.query(upsertSql, [isbn, title, edition, subject, page]);
      count++;
      if (count % 50 === 0) console.log(`✅ Imported ${count} books so far...`);
    } catch (err) {
      console.error("❌ Error importing ISBN:", isbn, err.message);
    }
  }

  await pool.end();
  console.log(`✅ Import complete. Total books upserted: ${count}`);
}

run().catch((e) => {
  console.error("💥 Fatal import error:", e);
  process.exit(1);
});
