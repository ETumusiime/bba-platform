// ============================================
//  BBA Mallory Catalogue – Cover Extraction (stable Windows version)
// ============================================
import fs from "fs";
import { spawnSync } from "child_process";
import pg from "pg";

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "bba_db",
  password: "Alpha12345!!!!!", // your password
  port: 5432,
});

const pdfPath = "EDU_Secondary_Catalogue_Digital_FY25 copy.pdf";
const outputDir = "public/covers";
fs.mkdirSync(outputDir, { recursive: true });

async function extract() {
  console.log("🚀 Starting cover extraction (spawnSync + ImageMagick)...");
  const totalPages = 108;

  for (let i = 1; i <= totalPages; i++) {
    const outputFile = `${outputDir}/page_${i}.jpg`;

    try {
      const pageIndex = i - 1;
      const result = spawnSync("magick", [
        "-density", "150",
        `${pdfPath}[${pageIndex}]`,
        "-quality", "90",
        outputFile
      ]);

      if (result.error) throw result.error;
      if (result.status !== 0) {
        console.error(`❌ Page ${i} error:`, result.stderr.toString());
      } else {
        console.log(`✅ Extracted page ${i} → covers/page_${i}.jpg`);
      }
    } catch (err) {
      console.error(`❌ Page ${i} error:`, err.message);
    }
  }

  await pool.end();
  console.log("🎉 Cover extraction complete!");
}

extract();
