import { VideoResource } from "@/types/curriculum";

export const FEATURED_VIDEOS: VideoResource[] = [
  {
    youtubeId: "quh7z1q7-uc",
    title: "Building LLMs from the Ground Up: A 3-Hour Coding Workshop",
    description:
      "Sebastian Raschka's condensed 3-hour hands-on workshop covering the full LLM pipeline — great starting point or review before diving into the full chapter series.",
    durationSeconds: 10800,
    source: "workshop",
    label: "3-hr Workshop",
  },
  {
    youtubeId: "p3sij8QzONQ",
    title: "Code an LLM from Scratch: Theory to RLHF (6-Hour Course)",
    description:
      "Comprehensive 6-hour freeCodeCamp course covering transformer architecture, RoPE, KV caching, MoE layers, supervised finetuning, and RLHF with PPO — from scratch.",
    durationSeconds: 21600,
    source: "freecodecamp",
    label: "freeCodeCamp 6hr",
  },
];
