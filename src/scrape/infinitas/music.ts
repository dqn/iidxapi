import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";

import type { Element } from "domhandler";

import type { MusicEntry } from "./types.js";
import { DOCS_DIR } from "../shared.js";

const TARGET_URL = "https://p.eagate.573.jp/game/infinitas/2/music/index.html";
const OUTPUT_FILE = path.join(DOCS_DIR, "infinitas/music.json");

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

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

    const appendTableRows = (table: Element, packName: string | null) => {
      $(table)
        .find("tr")
        .each((_, row) => {
          const tds = $(row).find("td");

          // Ensure we have at least Title and Artist columns
          if (tds.length >= 2) {
            const title = $(tds[0]).text().trim();
            const artist = $(tds[1]).text().trim();

            // Skip empty titles
            if (title) {
              musicList.push({ title, artist, packName });
            }
          }
        });
    };

    $("div#music-list").each((_, listEl) => {
      const list = $(listEl);
      const sectionId = list.children("div.cat").first().attr("id");

      if (sectionId === "leg" || sectionId === "trial") {
        return; // Skip LEGGENDARIA and Trial Mode
      }

      if (sectionId === "pac") {
        let currentPackName: string | null = null;

        list.children().each((_, child) => {
          const childEl = $(child);

          if (childEl.is("div.cat")) {
            const catId = childEl.attr("id");
            if (catId === "pac") {
              currentPackName = null;
              return;
            }

            const packNameText = childEl.find("strong").text();
            if (packNameText) {
              currentPackName = normalizeText(packNameText);
            }
            return;
          }

          if (childEl.is("table")) {
            appendTableRows(child as Element, currentPackName);
          }
        });

        return;
      }

      list.find("table").each((_, table) => {
        appendTableRows(table as Element, null);
      });
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
