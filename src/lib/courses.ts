export type CourseStatus = "available" | "coming-soon" | "beta";

export interface CourseDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  /** Where "Start Learning" navigates to */
  href: string;
  status: CourseStatus;
  /** Tailwind from-/to- color pair for card gradient */
  fromColor: string;
  toColor: string;
  accentColor: string;
  tags: string[];
  chapters?: number;
  notebooks?: number;
  estimatedHours?: number;
  author?: string;
  /** localStorage key that holds progress JSON (available courses only) */
  progressLocalStorageKey?: string;
  /** Total notebook count for progress calculation */
  totalNotebooks?: number;
}

export const COURSES: CourseDefinition[] = [
  {
    id: "llms-from-scratch",
    title: "LLMs from Scratch",
    subtitle: "Build a Large Language Model from the ground up",
    description:
      "Follow Sebastian Raschka's acclaimed open-source book to implement a GPT-style LLM step by step — from tokenization and attention mechanisms to pretraining and instruction finetuning.",
    href: "/chapter/ch01",
    status: "available",
    fromColor: "from-violet-500/20",
    toColor: "to-indigo-500/10",
    accentColor: "text-violet-400",
    tags: ["PyTorch", "Transformers", "Pretraining", "RLHF", "LoRA"],
    chapters: 7,
    notebooks: 22,
    estimatedHours: 40,
    author: "Sebastian Raschka",
    progressLocalStorageKey: "embriAIO_progress_v1",
    totalNotebooks: 22,
  },
  {
    id: "quantization",
    title: "Quantization & Efficient Inference",
    subtitle: "Make models 4× smaller without losing accuracy",
    description:
      "Master INT4/INT8 quantization, GPTQ, GGUF, bitsandbytes, and llama.cpp. Learn to run 70B models on consumer hardware through hands-on notebooks.",
    href: "#",
    status: "coming-soon",
    fromColor: "from-orange-500/20",
    toColor: "to-amber-500/10",
    accentColor: "text-orange-400",
    tags: ["GPTQ", "GGUF", "bitsandbytes", "llama.cpp", "AWQ"],
    chapters: 6,
    notebooks: 14,
    estimatedHours: 20,
  },
  {
    id: "finetuning",
    title: "Fine-tuning & Alignment",
    subtitle: "Adapt foundation models for your use case",
    description:
      "From full fine-tuning to LoRA, QLoRA, DPO, and PPO — learn every technique to align and specialize LLMs on custom datasets.",
    href: "#",
    status: "coming-soon",
    fromColor: "from-emerald-500/20",
    toColor: "to-teal-500/10",
    accentColor: "text-emerald-400",
    tags: ["LoRA", "QLoRA", "DPO", "RLHF", "SFT"],
    chapters: 8,
    notebooks: 18,
    estimatedHours: 30,
  },
  {
    id: "rag-vectors",
    title: "Vector Databases & RAG",
    subtitle: "Build retrieval-augmented generation systems",
    description:
      "Understand embeddings, build FAISS and ChromaDB indexes, and wire retrieval pipelines to LLMs for knowledge-grounded generation at scale.",
    href: "#",
    status: "coming-soon",
    fromColor: "from-cyan-500/20",
    toColor: "to-blue-500/10",
    accentColor: "text-cyan-400",
    tags: ["FAISS", "ChromaDB", "Embeddings", "LangChain", "RAG"],
    chapters: 5,
    notebooks: 12,
    estimatedHours: 18,
  },
  {
    id: "diffusion",
    title: "Diffusion Models from Scratch",
    subtitle: "Understand and build image generation models",
    description:
      "Implement DDPM, DDIM, and Stable Diffusion from scratch. Learn noise schedules, U-Net architectures, and classifier-free guidance.",
    href: "#",
    status: "coming-soon",
    fromColor: "from-pink-500/20",
    toColor: "to-rose-500/10",
    accentColor: "text-pink-400",
    tags: ["DDPM", "Stable Diffusion", "U-Net", "CFG", "PyTorch"],
    chapters: 6,
    notebooks: 15,
    estimatedHours: 25,
  },
  {
    id: "multimodal",
    title: "Multimodal AI",
    subtitle: "Vision + Language models end to end",
    description:
      "Build CLIP, LLaVA, and image-captioning pipelines. Understand cross-modal attention, contrastive pretraining, and visual instruction tuning.",
    href: "#",
    status: "coming-soon",
    fromColor: "from-yellow-500/20",
    toColor: "to-lime-500/10",
    accentColor: "text-yellow-400",
    tags: ["CLIP", "LLaVA", "ViT", "Cross-attention", "VQA"],
    chapters: 5,
    notebooks: 12,
    estimatedHours: 22,
  },
];
