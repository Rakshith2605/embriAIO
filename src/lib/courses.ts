export type CourseStatus = "available" | "coming-soon" | "beta";

export interface CourseDefinition {
  id: string;
  title: string;
  href: string;
  status: CourseStatus;
  accentColor: string;
  chapters?: number;
  videos?: number;
  notebooks?: number;
  /** localStorage key for progress */
  progressLocalStorageKey?: string;
  totalNotebooks?: number;
}

export const COURSES: CourseDefinition[] = [
  {
    id: "llms-from-scratch",
    title: "LLMs from Scratch",
    href: "/chapter/ch01",
    status: "available",
    accentColor: "text-violet-400",
    chapters: 7,
    videos: 9,
    notebooks: 22,
    progressLocalStorageKey: "embriAIO_progress_v1",
    totalNotebooks: 22,
  },
  {
    id: "quantization",
    title: "Quantization & Efficient Inference",
    href: "#",
    status: "coming-soon",
    accentColor: "text-orange-400",
    chapters: 6,
    videos: 6,
    notebooks: 14,
  },
  {
    id: "finetuning",
    title: "Fine-tuning & Alignment",
    href: "#",
    status: "coming-soon",
    accentColor: "text-emerald-400",
    chapters: 8,
    videos: 8,
    notebooks: 18,
  },
  {
    id: "rag-vectors",
    title: "Vector Databases & RAG",
    href: "#",
    status: "coming-soon",
    accentColor: "text-cyan-400",
    chapters: 5,
    videos: 5,
    notebooks: 12,
  },
  {
    id: "diffusion",
    title: "Diffusion Models from Scratch",
    href: "#",
    status: "coming-soon",
    accentColor: "text-pink-400",
    chapters: 6,
    videos: 6,
    notebooks: 15,
  },
  {
    id: "multimodal",
    title: "Multimodal AI",
    href: "#",
    status: "coming-soon",
    accentColor: "text-yellow-400",
    chapters: 5,
    videos: 5,
    notebooks: 12,
  },
];
