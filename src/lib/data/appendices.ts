import { Chapter } from "@/types/curriculum";

export const APPENDICES: Chapter[] = [
  {
    id: "appendix-a",
    order: 8,
    title: "Appendix A",
    subtitle: "Introduction to PyTorch",
    description:
      "A concise introduction to PyTorch covering tensors, autograd, neural network modules, and distributed training with DistributedDataParallel (DDP). Essential background if you're new to PyTorch.",
    tags: ["pytorch"],
    githubPath: "appendix-A",
    hasCode: true,
    icon: "Flame",
    color: "red",
    mainNotebooks: [],
    bonusFolders: [],
  },
  {
    id: "appendix-d",
    order: 9,
    title: "Appendix D",
    subtitle: "Adding Bells and Whistles to the Training Loop",
    description:
      "Enhance the basic training loop with gradient clipping, learning rate warmup and cosine decay, and evaluation during training. These techniques improve training stability and final model quality.",
    tags: ["pretraining"],
    githubPath: "appendix-D",
    hasCode: true,
    icon: "Settings",
    color: "slate",
    mainNotebooks: [],
    bonusFolders: [],
  },
  {
    id: "appendix-e",
    order: 10,
    title: "Appendix E",
    subtitle: "Parameter-Efficient Finetuning with LoRA",
    description:
      "Learn LoRA (Low-Rank Adaptation) — a memory-efficient finetuning technique that freezes model weights and adds trainable low-rank matrices. Widely used for finetuning large models on consumer hardware.",
    tags: ["lora", "finetuning"],
    githubPath: "appendix-E",
    hasCode: true,
    icon: "Layers",
    color: "purple",
    mainNotebooks: [],
    bonusFolders: [],
  },
];
