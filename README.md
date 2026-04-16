# emrAIO — LLMs from Scratch: Interactive Learning Platform

An interactive web platform built around Sebastian Raschka's open-source book [**Build A Large Language Model (From Scratch)**](https://github.com/rasbt/LLMs-from-scratch) (90k+ GitHub stars). emrAIO gives students and self-learners a single, unified interface to navigate all 7 chapters + appendices, watch video walkthroughs, read Jupyter notebooks with pre-rendered outputs, track progress, and search content — without juggling GitHub, YouTube, and Colab tabs.

---

## Features

- **Chapter navigation sidebar** — collapsible groups listing every video and notebook for each chapter; status dots (●/◐/○) show completion at a glance
- **Video listings** — all videos (Raschka's walkthroughs, freeCodeCamp 6-hour course, workshop sessions) listed with thumbnails and titles; click any row to expand an inline player
- **Notebook viewer** — `.ipynb` files rendered natively in React: markdown cells, code cells with execution counts, pre-computed outputs (text, tables, matplotlib plots), expandable error tracebacks — **no WASM, loads in ~100ms**
- **Binder fallback** — "Run on Binder" button on every notebook page for live code execution in a cloud environment
- **Progress tracking** — per-notebook completion state persisted to `localStorage`; progress bar per chapter and global progress in the sidebar footer
- **Fuzzy search** — `Cmd+K` / `Ctrl+K` opens a keyboard-navigable search dialog powered by Fuse.js
- **Dark / light mode** — system-aware with manual toggle
- **Fully static** — no server required; deployable to Vercel, GitHub Pages, or any CDN

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Notebook rendering | Custom React renderer (`marked` for markdown, base64 PNG for plots) |
| Search | Fuse.js (client-side fuzzy search) |
| Progress | `useReducer` + `localStorage` (SSR-safe) |
| Theming | `next-themes` |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout — fonts, ThemeProvider
│   ├── page.tsx                            # Redirects to /chapter/ch01
│   └── (learn)/
│       ├── layout.tsx                      # SidebarProvider + ProgressProvider
│       ├── chapter/[chapterId]/
│       │   ├── page.tsx                    # Chapter overview: videos + notebook list
│       │   └── notebook/[notebookSlug]/    # Notebook viewer
│       ├── appendix/[appendixId]/          # Same structure for appendices
│       └── search/page.tsx                 # Full-page search results
│
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx                  # Fixed sidebar shell
│   │   ├── SidebarChapterGroup.tsx         # Collapsible chapter group with videos + notebooks
│   │   ├── SidebarNotebookItem.tsx         # Single notebook row with status dot
│   │   ├── SidebarHeader.tsx               # Logo + title
│   │   ├── SidebarFooter.tsx               # Overall progress bar + reset
│   │   └── TopBar.tsx                      # Breadcrumb + search trigger + theme toggle
│   ├── chapter/
│   │   ├── ChapterHero.tsx                 # Chapter header card with progress ring
│   │   ├── VideoList.tsx                   # Videos as expandable list rows
│   │   ├── NotebookList.tsx                # Notebooks as navigable list rows
│   │   ├── BonusSection.tsx                # Collapsible bonus folder list
│   │   └── VideoEmbed.tsx                  # (legacy tab-based player, kept for reference)
│   ├── notebook/
│   │   ├── NotebookRenderer.tsx            # Core: fetches + renders .ipynb JSON in React
│   │   ├── JupyterFrame.tsx                # Thin adapter — extracts chapterId/filename
│   │   ├── NotebookToolbar.tsx             # GitHub link + Mark Complete + Fullscreen
│   │   └── CompletionToggle.tsx            # Writes completion state to ProgressContext
│   └── search/
│       ├── SearchDialog.tsx                # Cmd+K modal with keyboard navigation
│       ├── SearchResultItem.tsx            # Result row with chapter badge
│       └── (useSearch hook in hooks/)
│
├── context/
│   └── ProgressContext.tsx                 # useReducer + localStorage (hydration-safe)
│
├── hooks/
│   ├── useProgress.ts                      # Per-chapter + global progress helpers
│   ├── useSearch.ts                        # Fuse.js query state
│   └── useKeyboardShortcut.ts              # Cmd+K registration
│
├── lib/
│   ├── curriculum.ts                       # Single source of truth — all chapter/notebook data
│   ├── data/
│   │   ├── chapters.ts                     # Chapters 1–7 with video IDs + notebook paths
│   │   ├── appendices.ts                   # Appendix A, D, E data
│   │   └── featured-videos.ts              # Site-wide featured video list
│   ├── search-index.ts                     # Fuse.js index built from curriculum
│   └── utils.ts                            # cn(), GitHub URL helpers
│
└── types/
    └── curriculum.ts                       # All TypeScript interfaces

scripts/
└── fetch-notebooks.ts                      # Prebuild: downloads 22 .ipynb files from GitHub
                                            # into public/notebooks/ for browser-side rendering

public/
├── favicon.svg                             # emrAIO icon (extracted from full logo)
└── notebooks/                              # Downloaded .ipynb files served as JSON
    ├── ch02/ch02.ipynb
    ├── ch03/ch03.ipynb
    └── ...                                 # 22 notebooks total
```

---

## Curriculum Coverage

| ID | Chapter | Notebooks | Videos |
|---|---|---|---|
| ch01 | Understanding LLMs | — (conceptual) | Raschka overview + Workshop + freeCodeCamp |
| ch02 | Working with Text Data | 3 | Raschka |
| ch03 | Attention Mechanisms | 3 | Raschka |
| ch04 | GPT from Scratch | 2 | Raschka |
| ch05 | Pretraining on Unlabeled Data | 2 | Raschka |
| ch06 | Text Classification Finetuning | 3 | Raschka |
| ch07 | Instruction Following | 4 | Raschka |
| appendix-a | PyTorch Introduction | 3 | — |
| appendix-d | Training Loop Enhancements | 1 | — |
| appendix-e | LoRA Finetuning | 1 | — |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/Rakshith2605/embriAIO.git
cd embriAIO
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). The prebuild script (`tsx scripts/fetch-notebooks.ts`) runs automatically before each build and downloads notebooks from the LLMs-from-scratch GitHub repo into `public/notebooks/`.

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

No required environment variables for local development.

Optional: set `GITHUB_TOKEN` before running the build to avoid GitHub API rate limits when fetching notebooks:

```bash
GITHUB_TOKEN=ghp_... npm run build
```

---

## Notebook Rendering

Notebooks are rendered natively in React by `NotebookRenderer.tsx`:

1. The prebuild script fetches all `.ipynb` files from `github.com/rasbt/LLMs-from-scratch` and saves them to `public/notebooks/`
2. On the notebook page, the component fetches the JSON and renders each cell:
   - **Markdown cells** — converted to HTML via `marked`
   - **Code cells** — monospace pre-block with execution count label
   - **Stream output** — `stdout` / `stderr` with appropriate color
   - **Execute result** — plain text or HTML table
   - **Display data** — `image/png` rendered as a base64 `<img>` (matplotlib plots)
   - **Error output** — collapsible traceback with ANSI codes stripped

This approach loads in ~100ms vs 30–60 seconds with JupyterLite/Pyodide (which also can't run PyTorch in WASM). For live code execution, a **"Run on Binder"** button opens the notebook on mybinder.org.

---

## Deployment

The app is designed for zero-config Vercel deployment:

1. Push to GitHub
2. Import into [vercel.com](https://vercel.com)
3. No environment variables required

`vercel.json` configures `Content-Type: application/wasm` headers for any future JupyterLite assets.

---

## Contributing

This project is a learning tool built around Sebastian Raschka's work. If you find broken video IDs, missing notebooks, or UI bugs, please open an issue.

---

## Credits

- **Book & notebooks**: [Sebastian Raschka](https://github.com/rasbt) — [LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch)
- **freeCodeCamp course**: [Theory to RLHF](https://www.freecodecamp.org/news/code-an-llm-from-scratch-theory-to-rlhf/)
- **Platform**: Built with Next.js, Tailwind CSS, shadcn/ui, Fuse.js
