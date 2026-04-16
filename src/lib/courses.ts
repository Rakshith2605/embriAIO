export type CourseStatus = "available" | "coming-soon" | "beta";

export interface CourseDefinition {
  id: string;
  title: string;
  description: string;
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
    description:
      "Build a GPT-style large language model end-to-end — tokenization, attention, pretraining, finetuning, and RLHF. Based on Sebastian Raschka's open-source book.",
    href: "/chapter/ch01",
    status: "available",
    accentColor: "text-violet-400",
    chapters: 7,
    videos: 9,
    notebooks: 22,
    progressLocalStorageKey: "emrAIO_progress_v1",
    totalNotebooks: 22,
  },
  {
    id: "quantization",
    title: "Quantization & Efficient Inference",
    description:
      "INT8, GPTQ, AWQ, and beyond. Learn how to shrink models 4× without meaningful accuracy loss and serve them efficiently on consumer hardware.",
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
    description:
      "Full-parameter finetuning, LoRA, QLoRA, DPO, and RLHF. Align pre-trained models to follow instructions and human preferences.",
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
    description:
      "Embeddings, FAISS, pgvector, hybrid search, and retrieval-augmented generation. Give LLMs long-term memory over private data.",
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
    description:
      "DDPM, DDIM, classifier-free guidance, and latent diffusion. Understand the maths and code behind Stable Diffusion from first principles.",
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
    description:
      "Vision transformers, CLIP, image–text alignment, and vision–language models. Build systems that see, read, and reason across modalities.",
    href: "#",
    status: "coming-soon",
    accentColor: "text-yellow-400",
    chapters: 5,
    videos: 5,
    notebooks: 12,
  },
];
