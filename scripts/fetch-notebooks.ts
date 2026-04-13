#!/usr/bin/env tsx
/**
 * Prebuild script: downloads all .ipynb files from the LLMs-from-scratch
 * GitHub repo and places them in public/jupyter/files/ for JupyterLite.
 *
 * Usage: tsx scripts/fetch-notebooks.ts
 * Set GITHUB_TOKEN env var to avoid rate limiting (60 req/hr unauthenticated → 5000/hr authenticated).
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

const BASE_RAW = "https://raw.githubusercontent.com/rasbt/LLMs-from-scratch/main";
const OUTPUT_DIR = join(process.cwd(), "jupyterlite-content");
// Also write to public/notebooks/ so the browser can fetch .ipynb JSON directly
const PUBLIC_DIR = join(process.cwd(), "public", "notebooks");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const NOTEBOOKS: Array<{ githubPath: string; chapterId: string }> = [
  // Chapter 2
  { githubPath: "ch02/01_main-chapter-code/ch02.ipynb", chapterId: "ch02" },
  { githubPath: "ch02/01_main-chapter-code/dataloader.ipynb", chapterId: "ch02" },
  { githubPath: "ch02/01_main-chapter-code/exercise-solutions.ipynb", chapterId: "ch02" },
  // Chapter 3
  { githubPath: "ch03/01_main-chapter-code/ch03.ipynb", chapterId: "ch03" },
  { githubPath: "ch03/01_main-chapter-code/multihead-attention.ipynb", chapterId: "ch03" },
  { githubPath: "ch03/01_main-chapter-code/exercise-solutions.ipynb", chapterId: "ch03" },
  // Chapter 4
  { githubPath: "ch04/01_main-chapter-code/ch04.ipynb", chapterId: "ch04" },
  { githubPath: "ch04/01_main-chapter-code/exercise-solutions.ipynb", chapterId: "ch04" },
  // Chapter 5
  { githubPath: "ch05/01_main-chapter-code/ch05.ipynb", chapterId: "ch05" },
  { githubPath: "ch05/01_main-chapter-code/exercise-solutions.ipynb", chapterId: "ch05" },
  // Chapter 6
  { githubPath: "ch06/01_main-chapter-code/ch06.ipynb", chapterId: "ch06" },
  { githubPath: "ch06/01_main-chapter-code/load-finetuned-model.ipynb", chapterId: "ch06" },
  { githubPath: "ch06/01_main-chapter-code/exercise-solutions.ipynb", chapterId: "ch06" },
  // Chapter 7
  { githubPath: "ch07/01_main-chapter-code/ch07.ipynb", chapterId: "ch07" },
  { githubPath: "ch07/01_main-chapter-code/load-finetuned-model.ipynb", chapterId: "ch07" },
  { githubPath: "ch07/01_main-chapter-code/exercise-solutions.ipynb", chapterId: "ch07" },
  { githubPath: "ch07/04_preference-tuning-with-dpo/dpo-from-scratch.ipynb", chapterId: "ch07" },
  // Appendix A
  { githubPath: "appendix-A/01_main-chapter-code/code-part1.ipynb", chapterId: "appendix-a" },
  { githubPath: "appendix-A/01_main-chapter-code/code-part2.ipynb", chapterId: "appendix-a" },
  { githubPath: "appendix-A/01_main-chapter-code/exercise-solutions.ipynb", chapterId: "appendix-a" },
  // Appendix D
  { githubPath: "appendix-D/01_main-chapter-code/appendix-D.ipynb", chapterId: "appendix-d" },
  // Appendix E
  { githubPath: "appendix-E/01_main-chapter-code/appendix-E.ipynb", chapterId: "appendix-e" },
];

async function fetchNotebook(githubPath: string): Promise<string | null> {
  const url = `${BASE_RAW}/${githubPath}`;
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3.raw" };
  if (GITHUB_TOKEN) headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`  ⚠ HTTP ${res.status} for ${githubPath}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`  ⚠ Network error for ${githubPath}:`, err);
    return null;
  }
}

async function main() {
  console.log("📦 Fetching notebooks for JupyterLite...\n");
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let succeeded = 0;
  let failed = 0;

  for (const { githubPath, chapterId } of NOTEBOOKS) {
    const filename = githubPath.split("/").at(-1)!;
    const outDir = join(OUTPUT_DIR, chapterId);
    const outPath = join(outDir, filename);

    process.stdout.write(`  Fetching ${filename} (${chapterId})... `);

    // Skip if already downloaded (incremental builds)
    if (existsSync(outPath)) {
      console.log("(cached)");
      succeeded++;
      continue;
    }

    const content = await fetchNotebook(githubPath);
    if (content) {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outPath, content, "utf8");
      // Mirror to public/notebooks/ for browser-side JSON fetch
      const pubDir = join(PUBLIC_DIR, chapterId);
      mkdirSync(pubDir, { recursive: true });
      writeFileSync(join(pubDir, filename), content, "utf8");
      console.log("✓");
      succeeded++;
    } else {
      console.log("✗ (skipped)");
      failed++;
    }

    // Polite delay to avoid hammering GitHub
    await new Promise((r) => setTimeout(r, GITHUB_TOKEN ? 50 : 200));
  }

  console.log(`\n✅ Done: ${succeeded} fetched, ${failed} failed`);
  if (failed > 0) {
    console.log("   (Failed notebooks will show a load error in JupyterLite — not a build failure)");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
