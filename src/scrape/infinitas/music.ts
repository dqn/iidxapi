import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";

interface MusicEntry {
  title: string;
  artist: string;
}

const TARGET_URL = "https://p.eagate.573.jp/game/infinitas/2/music/index.html";
const OUTPUT_FILE = path.join(process.cwd(), "docs", "infinitas", "music.json");

async function scrapeMusic() {
  try {
    console.log(`Fetching ${TARGET_URL}...`);
    const response = await fetch(TARGET_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`,
      );
    }

    const html = await response.text();
    console.log("Parsing HTML...");
    const $ = cheerio.load(html);

    const musicList: MusicEntry[] = [];

    // Select all TRs. Cheerio handles multiple elements with same ID fine.
    // We strictly check for <td> elements to avoid <th> headers.
    $("div#music-list table tr").each((_, el) => {
      // Check if this row belongs to the LEGGENDARIA section
      // The structure is: <div id="music-list"><div class="cat" id="leg">...</div><table>...</table></div>
      // We can check if the closest matching previous 'div.cat' has id="leg"
      const parentBlock = $(el).closest("div#music-list");
      const categoryId = parentBlock.find("div.cat").attr("id");

      if (categoryId === "leg" || categoryId === "trial") {
        return; // Skip LEGGENDARIA and Trial Mode
      }

      const tds = $(el).find("td");

      // Ensure we have at least Title and Artist columns
      if (tds.length >= 2) {
        const title = $(tds[0]).text().trim();
        const artist = $(tds[1]).text().trim();

        // Skip empty titles
        if (title) {
          musicList.push({ title, artist });
        }
      }
    });

    console.log(`Found ${musicList.length} songs.`);

    console.log(`Writing to ${OUTPUT_FILE}...`);
    await fs.ensureDir(path.dirname(OUTPUT_FILE));
    await fs.writeJson(OUTPUT_FILE, musicList, { spaces: 2 });

    console.log("Done.");
  } catch (error) {
    console.error("Error during scraping:", error);
    process.exit(1);
  }
}

scrapeMusic();
