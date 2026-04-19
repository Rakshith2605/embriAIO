-- ============================================================
-- Seed: LLMs from Scratch + coming-soon courses
-- ============================================================

-- Platform author (system account)
INSERT INTO public.profiles (id, email, name, image)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'platform@embriaio.com',
  'embriAIO',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- ─── Main Course: LLMs from Scratch ──────────────────────
INSERT INTO public.courses (id, author_id, slug, title, description, accent_color, status, course_type, href, chapters_count, videos_count, notebooks_count, progress_storage_key, total_notebooks)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'b74498b2-aafe-42e3-8e1a-a791ab137204',
  'llms-from-scratch',
  'LLMs from Scratch',
  'Build a GPT-style large language model end-to-end — tokenization, attention, pretraining, finetuning, and RLHF. Based on Sebastian Raschka''s open-source book.',
  'violet',
  'published',
  'platform',
  '/chapter/ch01',
  7, 9, 22,
  'embriAIO_progress_v1',
  22
) ON CONFLICT (slug) DO NOTHING;

-- ─── Coming-soon courses ────────────────────────────────
INSERT INTO public.courses (id, author_id, slug, title, description, accent_color, status, course_type, href, chapters_count, videos_count, notebooks_count)
VALUES
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'quantization', 'Quantization & Efficient Inference', 'INT8, GPTQ, AWQ, and beyond. Learn how to shrink models 4× without meaningful accuracy loss and serve them efficiently on consumer hardware.', 'orange', 'draft', 'platform', '#', 6, 6, 14),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'finetuning', 'Fine-tuning & Alignment', 'Full-parameter finetuning, LoRA, QLoRA, DPO, and RLHF. Align pre-trained models to follow instructions and human preferences.', 'emerald', 'draft', 'platform', '#', 8, 8, 18),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'rag-vectors', 'Vector Databases & RAG', 'Embeddings, FAISS, pgvector, hybrid search, and retrieval-augmented generation. Give LLMs long-term memory over private data.', 'cyan', 'draft', 'platform', '#', 5, 5, 12),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'diffusion', 'Diffusion Models from Scratch', 'DDPM, DDIM, classifier-free guidance, and latent diffusion. Understand the maths and code behind Stable Diffusion from first principles.', 'pink', 'draft', 'platform', '#', 6, 6, 15),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'multimodal', 'Multimodal AI', 'Vision transformers, CLIP, image–text alignment, and vision–language models. Build systems that see, read, and reason across modalities.', 'yellow', 'draft', 'platform', '#', 5, 5, 12)
ON CONFLICT (slug) DO NOTHING;

-- ─── LLMs from Scratch CHAPTERS ─────────────────────────
-- ch01
INSERT INTO public.course_chapters (id, course_id, "order", title, description, subtitle, tags, github_path, has_code, icon, color)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 'Chapter 1', 'Explore what LLMs are, how they work at a high level, and the development lifecycle from pretraining to finetuning. No coding required — this chapter builds the conceptual foundation for everything that follows.', 'Understanding Large Language Models', '{}', 'ch01', false, 'Brain', 'violet');

-- ch02
INSERT INTO public.course_chapters (id, course_id, "order", title, description, subtitle, tags, github_path, has_code, icon, color)
VALUES
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2, 'Chapter 2', 'Build the text → token → embedding pipeline that feeds every transformer. Implement BPE tokenization, create a DataLoader that yields input–target pairs, and add positional encodings.', 'Working with Text Data', '{"tokenization"}', 'ch02', true, 'FileText', 'blue');

-- ch03
INSERT INTO public.course_chapters (id, course_id, "order", title, description, subtitle, tags, github_path, has_code, icon, color)
VALUES
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 3, 'Chapter 3', 'Code the core of every modern LLM — self-attention. Start with simplified attention, add trainable weights, then implement causal (masked) multi-head attention from scratch.', 'Coding Attention Mechanisms', '{"attention"}', 'ch03', true, 'Brain', 'indigo');

-- ch04
INSERT INTO public.course_chapters (id, course_id, "order", title, description, subtitle, tags, github_path, has_code, icon, color)
VALUES
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 4, 'Chapter 4', 'Assemble the full GPT architecture: layer norms, GELU activations, feed-forward blocks, residual connections, and the final token-prediction head. Also initialize weights and generate text.', 'Implementing a GPT Model from Scratch', '{"gpt","architecture"}', 'ch04', true, 'Cpu', 'red');

-- ch05
INSERT INTO public.course_chapters (id, course_id, "order", title, description, subtitle, tags, github_path, has_code, icon, color)
VALUES
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 5, 'Chapter 5', 'Train your GPT model on real text data. Implement the training loop, learning rate scheduling, gradient clipping, and weight saving. Then load pretrained GPT-2 weights and generate coherent text.', 'Pretraining on Unlabeled Data', '{"pretraining","gpt"}', 'ch05', true, 'Zap', 'yellow');

-- ch06
INSERT INTO public.course_chapters (id, course_id, "order", title, description, subtitle, tags, github_path, has_code, icon, color)
VALUES
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 6, 'Chapter 6', 'Adapt a pretrained GPT model to classify spam vs. not spam. Learn how to replace the language model head with a classification head, freeze layers strategically, and evaluate model accuracy.', 'Finetuning for Text Classification', '{"finetuning","evaluation"}', 'ch06', true, 'Tag', 'green');

-- ch07
INSERT INTO public.course_chapters (id, course_id, "order", title, description, subtitle, tags, github_path, has_code, icon, color)
VALUES
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 7, 'Chapter 7', 'Teach the model to follow human instructions using supervised instruction finetuning. Build an Alpaca-style dataset, train the model, and evaluate responses. Also covers Direct Preference Optimization (DPO).', 'Finetuning to Follow Instructions', '{"finetuning","evaluation"}', 'ch07', true, 'MessageSquare', 'pink');

-- ─── Appendices ──────────────────────────────────────────
INSERT INTO public.course_chapters (id, course_id, "order", title, description, subtitle, tags, github_path, has_code, icon, color)
VALUES
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 8, 'Appendix A', 'A concise introduction to PyTorch covering tensors, autograd, neural network modules, and distributed training with DistributedDataParallel (DDP). Essential background if you''re new to PyTorch.', 'Introduction to PyTorch', '{"pytorch"}', 'appendix-A', true, 'Flame', 'red'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 9, 'Appendix D', 'Enhance the basic training loop with gradient clipping, learning rate warmup and cosine decay, and evaluation during training. These techniques improve training stability and final model quality.', 'Adding Bells and Whistles to the Training Loop', '{"pretraining"}', 'appendix-D', true, 'Settings', 'slate'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 10, 'Appendix E', 'Learn LoRA (Low-Rank Adaptation) — a memory-efficient finetuning technique that freezes model weights and adds trainable low-rank matrices. Widely used for finetuning large models on consumer hardware.', 'Parameter-Efficient Finetuning with LoRA', '{"lora","finetuning"}', 'appendix-E', true, 'Layers', 'purple');

-- ─── Chapter NOTEBOOKS ───────────────────────────────────

-- ch02 notebooks
INSERT INTO public.chapter_notebooks (id, chapter_id, title, description, "order", slug, filename, github_path, notebook_type, estimated_minutes) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', 'Main Chapter Code', 'Complete implementation of the BPE tokenizer, data loader, and embeddings.', 1, 'ch02-main', 'ch02.ipynb', 'ch02/01_main-chapter-code/ch02.ipynb', 'main', 120),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', 'Building a DataLoader', 'Build a DataLoader from scratch that yields overlapping input–target pairs for LLM training.', 2, 'ch02-dataloader', 'dataloader.ipynb', 'ch02/01_main-chapter-code/dataloader.ipynb', 'supplemental', 30),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', 'Exercise Solutions', 'Worked solutions for all chapter exercises.', 3, 'ch02-exercises', 'exercise-solutions.ipynb', 'ch02/01_main-chapter-code/exercise-solutions.ipynb', 'exercise', 20);

-- ch03 notebooks
INSERT INTO public.chapter_notebooks (id, chapter_id, title, description, "order", slug, filename, github_path, notebook_type, estimated_minutes) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000003', 'Main Chapter Code', 'Full implementation of self-attention, causal masking, and multi-head attention.', 1, 'ch03-main', 'ch03.ipynb', 'ch03/01_main-chapter-code/ch03.ipynb', 'main', 120),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000003', 'Multi-Head Attention Deep Dive', 'Detailed walkthrough comparing the split-QKV and stacked-QKV implementations.', 2, 'ch03-multihead', 'multihead-attention.ipynb', 'ch03/01_main-chapter-code/multihead-attention.ipynb', 'supplemental', 40),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000003', 'Exercise Solutions', 'Worked solutions for all chapter exercises.', 3, 'ch03-exercises', 'exercise-solutions.ipynb', 'ch03/01_main-chapter-code/exercise-solutions.ipynb', 'exercise', 20);

-- ch04 notebooks
INSERT INTO public.chapter_notebooks (id, chapter_id, title, description, "order", slug, filename, github_path, notebook_type, estimated_minutes) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000004', 'Main Chapter Code', 'Build the full GPT architecture with layer norm, GELU, residual connections, and generation.', 1, 'ch04-main', 'ch04.ipynb', 'ch04/01_main-chapter-code/ch04.ipynb', 'main', 150),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000004', 'Exercise Solutions', 'Worked solutions for all chapter exercises.', 2, 'ch04-exercises', 'exercise-solutions.ipynb', 'ch04/01_main-chapter-code/exercise-solutions.ipynb', 'exercise', 25);

-- ch05 notebooks
INSERT INTO public.chapter_notebooks (id, chapter_id, title, description, "order", slug, filename, github_path, notebook_type, estimated_minutes) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000005', 'Main Chapter Code', 'Complete pretraining loop and GPT-2 weight loading.', 1, 'ch05-main', 'ch05.ipynb', 'ch05/01_main-chapter-code/ch05.ipynb', 'main', 150),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000005', 'Exercise Solutions', 'Worked solutions for all chapter exercises.', 2, 'ch05-exercises', 'exercise-solutions.ipynb', 'ch05/01_main-chapter-code/exercise-solutions.ipynb', 'exercise', 30);

-- ch06 notebooks
INSERT INTO public.chapter_notebooks (id, chapter_id, title, description, "order", slug, filename, github_path, notebook_type, estimated_minutes) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000006', 'Main Chapter Code', 'Finetune GPT-2 for spam classification with a custom head.', 1, 'ch06-main', 'ch06.ipynb', 'ch06/01_main-chapter-code/ch06.ipynb', 'main', 120),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000006', 'Loading a Finetuned Model', 'Load and run inference on a saved finetuned classification model.', 2, 'ch06-load-finetuned', 'load-finetuned-model.ipynb', 'ch06/01_main-chapter-code/load-finetuned-model.ipynb', 'supplemental', 20),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000006', 'Exercise Solutions', 'Worked solutions for all chapter exercises.', 3, 'ch06-exercises', 'exercise-solutions.ipynb', 'ch06/01_main-chapter-code/exercise-solutions.ipynb', 'exercise', 25);

-- ch07 notebooks
INSERT INTO public.chapter_notebooks (id, chapter_id, title, description, "order", slug, filename, github_path, notebook_type, estimated_minutes) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000007', 'Main Chapter Code', 'Full instruction finetuning pipeline with dataset preparation and training.', 1, 'ch07-main', 'ch07.ipynb', 'ch07/01_main-chapter-code/ch07.ipynb', 'main', 150),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000007', 'Loading a Finetuned Model', 'Load and chat with your finetuned instruction-following model.', 2, 'ch07-load-finetuned', 'load-finetuned-model.ipynb', 'ch07/01_main-chapter-code/load-finetuned-model.ipynb', 'supplemental', 15),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000007', 'Exercise Solutions', 'Worked solutions for all chapter exercises.', 3, 'ch07-exercises', 'exercise-solutions.ipynb', 'ch07/01_main-chapter-code/exercise-solutions.ipynb', 'exercise', 30),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000007', 'Direct Preference Optimization (DPO)', 'Implement DPO to align the model with human preferences without a reward model.', 4, 'ch07-dpo', 'dpo-from-scratch.ipynb', 'ch07/04_preference-tuning-with-dpo/dpo-from-scratch.ipynb', 'bonus', 90);

-- Appendix A notebooks
INSERT INTO public.chapter_notebooks (id, chapter_id, title, description, "order", slug, filename, github_path, notebook_type, estimated_minutes) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000008', 'PyTorch Basics (Part 1)', 'Tensors, operations, autograd, and building neural networks in PyTorch.', 1, 'appendix-a-part1', 'code-part1.ipynb', 'appendix-A/01_main-chapter-code/code-part1.ipynb', 'main', 60),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000008', 'PyTorch Basics (Part 2)', 'DataLoaders, training loops, GPU usage, and distributed training.', 2, 'appendix-a-part2', 'code-part2.ipynb', 'appendix-A/01_main-chapter-code/code-part2.ipynb', 'main', 60),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000008', 'Exercise Solutions', 'Worked solutions for all appendix exercises.', 3, 'appendix-a-exercises', 'exercise-solutions.ipynb', 'appendix-A/01_main-chapter-code/exercise-solutions.ipynb', 'exercise', 20);

-- Appendix D notebooks
INSERT INTO public.chapter_notebooks (id, chapter_id, title, description, "order", slug, filename, github_path, notebook_type, estimated_minutes) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000009', 'Enhanced Training Loop', 'Gradient clipping, LR warmup/decay, and evaluation during training.', 1, 'appendix-d-main', 'appendix-D.ipynb', 'appendix-D/01_main-chapter-code/appendix-D.ipynb', 'main', 75);

-- Appendix E notebooks
INSERT INTO public.chapter_notebooks (id, chapter_id, title, description, "order", slug, filename, github_path, notebook_type, estimated_minutes) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000010', 'LoRA Finetuning', 'Implement LoRA from scratch and apply it to GPT-2 finetuning.', 1, 'appendix-e-main', 'appendix-E.ipynb', 'appendix-E/01_main-chapter-code/appendix-E.ipynb', 'main', 90);

-- ─── Chapter VIDEOS (primary per-chapter) ────────────────

INSERT INTO public.chapter_videos (id, chapter_id, title, "order", youtube_id, source, is_primary) VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 'Build an LLM from Scratch 1 — Set Up Your Code Environment', 1, 'yAcWnfsZhzo', 'raschka', true),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', '3-Hour Coding Workshop — Full LLM Pipeline Overview', 2, 'quh7z1q7-uc', 'workshop', false),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 'Theory to RLHF — 6-Hour freeCodeCamp Course', 3, 'p3sij8QzONQ', 'freecodecamp', false),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', 'Build an LLM from Scratch 2 — Working with Text Data', 1, '341Rb8fJxY0', 'raschka', true),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000003', 'Build an LLM from Scratch 3 — Coding Attention Mechanisms', 1, '-Ll8DtpNtvk', 'raschka', true),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000004', 'Build an LLM from Scratch 4 — Implementing a GPT Model', 1, 'YSAkgEarBGE', 'raschka', true),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000005', 'Build an LLM from Scratch 5 — Pretraining on Unlabeled Data', 1, 'Zar2TJv-sE0', 'raschka', true),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000006', 'Build an LLM from Scratch 6 — Finetuning for Classification', 1, '5PFXJYme4ik', 'raschka', true),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000007', 'Build an LLM from Scratch 7 — Instruction Finetuning', 1, '4yNswvhPWCQ', 'raschka', true);

-- ─── Bonus Folders ───────────────────────────────────────

-- ch02 bonus
INSERT INTO public.chapter_bonus_folders (chapter_id, slug, title, github_path, description, "order") VALUES
  ('20000000-0000-0000-0000-000000000002', 'ch02-bpe-openai', 'Understanding OpenAI BPE Tokenizer', 'ch02/02_bonus_bytepair-encoder', 'Byte pair encoding implementation matching the OpenAI tiktoken tokenizer.', 1),
  ('20000000-0000-0000-0000-000000000002', 'ch02-embeddings-comparison', 'Comparing Token Embedding Approaches', 'ch02/03_bonus-embedding-vs-matmul', 'Compare nn.Embedding vs. one-hot × weight-matrix approaches.', 2),
  ('20000000-0000-0000-0000-000000000002', 'ch02-dataloader-intuition', 'DataLoader Intuition', 'ch02/04_bonus-dataloader-intuition', 'Visual intuition for how the sliding-window DataLoader creates training pairs.', 3);

-- ch03 bonus
INSERT INTO public.chapter_bonus_folders (chapter_id, slug, title, github_path, description, "order") VALUES
  ('20000000-0000-0000-0000-000000000003', 'ch03-flash-attention', 'Flash Attention', 'ch03/02_bonus_efficient-multihead-attention', 'Memory-efficient attention with FlashAttention and PyTorch''s scaled_dot_product_attention.', 1),
  ('20000000-0000-0000-0000-000000000003', 'ch03-rope', 'Rotary Position Embeddings (RoPE)', 'ch03/03_understanding-buffers', 'Understand RoPE — the position encoding used in Llama, Qwen, and Gemma.', 2);

-- ch04 bonus
INSERT INTO public.chapter_bonus_folders (chapter_id, slug, title, github_path, description, "order") VALUES
  ('20000000-0000-0000-0000-000000000004', 'ch04-kv-cache', 'KV Cache Optimization', 'ch04/02_performance-analysis', 'Implement key-value caching for faster autoregressive text generation.', 1),
  ('20000000-0000-0000-0000-000000000004', 'ch04-gqa', 'Grouped-Query Attention (GQA)', 'ch04/03_bonus_gqa', 'GQA as used in Llama, Qwen3, and Gemma — reduce memory with shared KV heads.', 2),
  ('20000000-0000-0000-0000-000000000004', 'ch04-mla', 'Multi-Head Latent Attention (MLA)', 'ch04/04_kv_cache', 'MLA as used in DeepSeek V3 — compress KV cache via low-rank projection.', 3),
  ('20000000-0000-0000-0000-000000000004', 'ch04-moe', 'Mixture of Experts (MoE)', 'ch04/05_bonus_hparam-tuning', 'Add sparse MoE layers to scale model capacity without proportional compute.', 4);

-- ch05 bonus
INSERT INTO public.chapter_bonus_folders (chapter_id, slug, title, github_path, description, "order") VALUES
  ('20000000-0000-0000-0000-000000000005', 'ch05-gutenberg', 'Pretraining on Project Gutenberg', 'ch05/03_bonus_pretraining_on_gutenberg', 'Train on thousands of public domain books from Project Gutenberg.', 1),
  ('20000000-0000-0000-0000-000000000005', 'ch05-lr-schedulers', 'Learning Rate Schedulers', 'ch05/04_learning_rate_schedulers', 'Cosine decay, linear warmup, and other LR scheduling strategies.', 2),
  ('20000000-0000-0000-0000-000000000005', 'ch05-qwen3', 'Qwen3 Architecture', 'ch05/07_gpt_to_llama', 'Apply Chapter 5 pretraining concepts to the Qwen3 architecture.', 3),
  ('20000000-0000-0000-0000-000000000005', 'ch05-gemma3', 'Gemma3 / Gemma4 Architecture', 'ch05/10_llm-instruction-eval-ollama', 'Explore Google''s Gemma3 and Gemma4 model architectures.', 4),
  ('20000000-0000-0000-0000-000000000005', 'ch05-olmo3', 'OLMo3 Architecture', 'ch05/11_qwen3', 'Allen Institute''s open language model architecture.', 5),
  ('20000000-0000-0000-0000-000000000005', 'ch05-memory-efficient', 'Memory-Efficient Weight Loading', 'ch05/05_bonus_hparam-tuning', 'Load large model weights without running out of CPU/GPU memory.', 6);

-- ch06 bonus
INSERT INTO public.chapter_bonus_folders (chapter_id, slug, title, github_path, description, "order") VALUES
  ('20000000-0000-0000-0000-000000000006', 'ch06-imdb', 'IMDb Sentiment Classification', 'ch06/02_bonus_additional-experiments', 'Scale up to the 50,000-review IMDb dataset for binary sentiment analysis.', 1);

-- ch07 bonus
INSERT INTO public.chapter_bonus_folders (chapter_id, slug, title, github_path, description, "order") VALUES
  ('20000000-0000-0000-0000-000000000007', 'ch07-dataset-generation', 'Synthetic Dataset Generation', 'ch07/02_dataset-utilities', 'Generate and filter instruction datasets with near-duplicate detection.', 1),
  ('20000000-0000-0000-0000-000000000007', 'ch07-evaluation', 'Model Evaluation with Llama / GPT-4', 'ch07/03_model-evaluation', 'Use Ollama-served Llama 3 or GPT-4 to automatically grade model responses.', 2),
  ('20000000-0000-0000-0000-000000000007', 'ch07-dpo-data', 'DPO Preference Data Generation', 'ch07/04_preference-tuning-with-dpo', 'Use Ollama to generate preference-labeled data for DPO training.', 3);

-- ─── Featured Videos ─────────────────────────────────────
INSERT INTO public.featured_videos (course_id, youtube_id, title, description, duration_seconds, source, label, "order") VALUES
  ('10000000-0000-0000-0000-000000000001', 'quh7z1q7-uc', 'Building LLMs from the Ground Up: A 3-Hour Coding Workshop', 'Sebastian Raschka''s condensed 3-hour hands-on workshop covering the full LLM pipeline — great starting point or review before diving into the full chapter series.', 10800, 'workshop', '3-hr Workshop', 1),
  ('10000000-0000-0000-0000-000000000001', 'p3sij8QzONQ', 'Code an LLM from Scratch: Theory to RLHF (6-Hour Course)', 'Comprehensive 6-hour freeCodeCamp course covering transformer architecture, RoPE, KV caching, MoE layers, supervised finetuning, and RLHF with PPO — from scratch.', 21600, 'freecodecamp', 'freeCodeCamp 6hr', 2);
