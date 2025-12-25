import fs from "fs-extra";
import path from "path";
import { chromium } from "playwright";

export interface DifficultyEntry {
  title: string;
  tier: string;
  attributes: string[];
}

interface ScrapeOptions {
  targetUrl: string;
  outputFile: string;
}

export const DOCS_DIR = path.join(import.meta.dirname, "../../docs");
export const DOCS_PRETTY_DIR = path.join(
  import.meta.dirname,
  "../../docs-pretty",
);

function resolveChromiumExecutablePath(): string | undefined {
  const defaultPath = chromium.executablePath();
  if (fs.existsSync(defaultPath)) {
    return defaultPath;
  }

  if (process.platform === "darwin") {
    const armPath = defaultPath.replace(/-mac-x64/g, "-mac-arm64");
    if (armPath !== defaultPath && fs.existsSync(armPath)) {
      return armPath;
    }
  }

  return undefined;
}

function resolvePrettyOutputFile(outputFile: string): string {
  const relativePath = path.relative(DOCS_DIR, outputFile);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    if (outputFile.endsWith(".json")) {
      return outputFile.replace(/\.json$/, ".pretty.json");
    }
    return `${outputFile}.pretty`;
  }
  return path.join(DOCS_PRETTY_DIR, relativePath);
}

export async function writeDocsJson<T>(
  outputFile: string,
  payload: T,
): Promise<void> {
  await fs.ensureDir(path.dirname(outputFile));
  await fs.writeJson(outputFile, payload);

  const prettyFile = resolvePrettyOutputFile(outputFile);
  await fs.ensureDir(path.dirname(prettyFile));
  await fs.writeJson(prettyFile, payload, { spaces: 2 });
}

// atwiki 難易度表のスクレイピング共通関数
export async function scrapeDifficultyTable(
  options: ScrapeOptions,
): Promise<void> {
  const { targetUrl, outputFile } = options;

  console.log("Launching browser...");
  const executablePath = resolveChromiumExecutablePath();
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-crashpad",
      "--disable-crash-reporter",
    ],
    executablePath,
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
      const results: { title: string; tier: string; attributes: string[] }[] =
        [];
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

        // テーブルの各行から曲名と属性を取得（ヘッダー行をスキップ）
        const rows = table.querySelectorAll("tr");
        rows.forEach((row, index) => {
          if (index === 0) return; // ヘッダー行

          const cells = row.querySelectorAll("td");
          if (cells.length >= 5) {
            const title = cells[1].textContent?.trim() ?? "";
            const attributeText = cells[4].textContent?.trim() ?? "";
            // カンマや読点で分割し、空白をトリムして空文字列を除外
            const attributes = attributeText
              .split(/[、,]/)
              .map((s) => s.trim())
              .filter((s) => s !== "");
            if (title) {
              results.push({ title, tier: tier!, attributes });
            }
          }
        });
      });

      return results;
    });

    console.log(`Found ${entries.length} songs.`);

    console.log("Writing output files...");
    await writeDocsJson(outputFile, entries);

    console.log("Done.");
  } catch (error) {
    console.error("Error during scraping:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}
