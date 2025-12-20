import fs from "fs-extra";
import path from "path";

import type { MusicEntry } from "./types.js";
import { DOCS_DIR } from "../shared.js";

const FILE_PATH = path.join(DOCS_DIR, "infinitas/music.json");

async function checkDuplicates() {
  if (!fs.existsSync(FILE_PATH)) {
    console.error("music.json not found. Run scrape first.");
    process.exit(1);
  }

  try {
    const data: MusicEntry[] = await fs.readJson(FILE_PATH);
    const titleCounts = new Map<string, number>();
    const duplicates: string[] = [];

    data.forEach((entry) => {
      const count = titleCounts.get(entry.title) || 0;
      titleCounts.set(entry.title, count + 1);
      if (count === 1) {
        // It's now 2
        duplicates.push(entry.title);
      }
    });

    if (duplicates.length > 0) {
      console.error("❌ Found duplicate titles:");
      duplicates.sort().forEach((title) => {
        const count = titleCounts.get(title);
        console.error(`- "${title}" (Count: ${count})`);
      });
      process.exit(1); // Fail the script
    } else {
      console.log("✅ No duplicates found.");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkDuplicates();
