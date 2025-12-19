import fs from "fs-extra";
import path from "path";
import { chromium } from "playwright";

export interface DifficultyEntry {
  title: string;
  tier: string;
}

interface ScrapeOptions {
  targetUrl: string;
  outputFile: string;
}

export const DOCS_DIR = path.join(import.meta.dirname, "../../docs");

// atwiki 難易度表のスクレイピング共通関数
export async function scrapeDifficultyTable(
  options: ScrapeOptions,
): Promise<void> {
  const { targetUrl, outputFile } = options;

  console.log("Launching browser...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    console.log(`Fetching ${targetUrl}...`);
    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log("Waiting for Cloudflare challenge...");
    await page.waitForSelector("table", { timeout: 60000 });

    console.log("Extracting data...");
    const entries = await page.evaluate(() => {
      const results: { title: string; tier: string }[] = [];
      const tables = document.querySelectorAll("table");

      tables.forEach((table) => {
        // テーブルの前の見出しからtierを取得
        let prev = table.previousElementSibling;
        let tier: string | null = null;

        while (prev && !tier) {
          if (prev.tagName.match(/^H[1-6]$/)) {
            const text = prev.textContent?.trim() ?? "";
            // "(xx曲)" の部分を除去
            tier = text.replace(/\s*\(\d+曲\)$/, "");
          }
          prev = prev.previousElementSibling;
        }

        // tierが取得できない場合はスキップ
        if (!tier) return;

        // テーブルの各行から曲名を取得（ヘッダー行をスキップ）
        const rows = table.querySelectorAll("tr");
        rows.forEach((row, index) => {
          if (index === 0) return; // ヘッダー行

          const cells = row.querySelectorAll("td");
          if (cells.length >= 2) {
            const title = cells[1].textContent?.trim() ?? "";
            if (title) {
              results.push({ title, tier: tier! });
            }
          }
        });
      });

      return results;
    });

    console.log(`Found ${entries.length} songs.`);

    console.log(`Writing to ${outputFile}...`);
    await fs.ensureDir(path.dirname(outputFile));
    await fs.writeJson(outputFile, entries, { spaces: 2 });

    console.log("Done.");
  } catch (error) {
    console.error("Error during scraping:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}
