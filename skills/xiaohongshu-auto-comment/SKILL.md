---
name: xiaohongshu-auto-comment
description: Generate fast, copy-ready Xiaohongshu comment batches for discovery-feed engagement. Use when the user says things like “小红书自动评论”, wants comments for a whole page of posts, wants a repeatable workflow of “you read the page, I paste later”, or needs niche-aware Xiaohongshu replies that are short, sharp, resonant, and tailored by post type (especially more technical/insider language for technical posts).
---

# Xiaohongshu Auto Comment

Read the current Xiaohongshu feed page, then return a numbered batch of short comments the user can paste one by one.

## Workflow

1. Confirm the operating mode only if needed.
   - Default mode: read one full page of posts, generate one comment per visible post, wait for the user to say they finished pasting, then continue to the next page.
   - Prefer directly opening/using a controllable browser yourself when possible.
   - Do not ask the user to connect OpenClaw Browser Relay for this workflow; first try opening Xiaohongshu in the browser yourself.
   - If direct browser access fails, then fall back to screenshots or pasted titles/text.

2. Read the page in order.
   - Capture visible post titles and any obvious topic signals.
   - Keep output aligned to page order so the user can paste efficiently.
   - Do not ask the user to send individual posts unless browser access fails.

3. Infer the post type before writing.
   - Growth / getting followers / business / motivation
   - Emotional / relationship / self-awareness
   - Technical / digital tools / software / hardware / workflows
   - Lifestyle / aesthetics / women’s perspective / personal expression
   - General hot-take / opinion / social commentary

4. Write one comment per post.
   - Default length: one sentence.
   - Make it copy-ready; no labels inside each line besides the outer numbering.
   - Avoid sounding like spam, template sludge, or empty praise.

## Style Rules

Keep the overall persona consistent:
- Neighbor-girl warmth
- Professional but sweet
- Gentle with strength
- Short, pretty, high-level, generous

But optimize for engagement:
- Sharp opening or sharp turn of phrase
- Easy to resonate with
- Leaves a little thought or insight
- Slightly deep, but not preachy
- Not generic chicken soup

## Tone by Post Type

### Growth / followers / monetization / business
Prefer lines about:
- value before numbers
- rhythm, consistency, compounding
- audience quality over vanity metrics
- energy / expression / value alignment

Examples of direction:
- “先别盯数字，先把值得被看见这件事做扎实。”
- “来的不是粉丝，是被你打动的人。”

### Emotional / relationship / self-awareness
Prefer lines about:
- boundaries
- clarity
- authenticity after safety
- emotional maturity
- softness with backbone

Examples of direction:
- “温柔不是没锋芒，是有分寸。”
- “稳定以后，真实才敢出场。”

### Technical posts
Switch to insider language.
- Use technical vocabulary, practitioner shorthand, or configuration judgment when appropriate.
- Sound like someone in the field, not like a bystander.
- If the post is about computer setup, tools, software, automation, hardware, performance, or workflows, it is acceptable to mention:
  - architecture / stack / latency / stability / bottleneck / trade-off
  - deployment / proxy / config / compatibility / throughput / cost-performance
  - hardware or configuration suggestions
- Keep it short even when technical.

Examples of direction:
- “这不是情绪问题，是链路稳定性问题。”
- “真正的瓶颈往往不在参数，在整体架构。”
- “这配置思路是对的，先补短板别盲目堆料。”

### Lifestyle / aesthetics / women’s expression
Prefer lines about:
- taste, restraint, aura, boundaries, texture
- elegance over showing off
- calm confidence

Example direction:
- “高级感不是堆出来的，是克制里长出来的。”

### Opinion / hot-take / social commentary
Prefer lines that:
- validate the insight
- sharpen the core contradiction
- add one level of perspective

Example direction:
- “真正刺痛人的，不是观点，是它刚好说中了现实。”

## Output Format

Return comments as a plain numbered list:

1. …
2. …
3. …

Rules:
- One comment per visible post.
- Match the page order.
- No markdown table.
- No long explanations unless the user asks.
- If one post clearly needs a stronger or more technical angle, just do it; do not ask first.

## Decision Heuristics

- If the title is vague but the direction is obvious, still write decisively.
- If the post looks low-value or repetitive, still give a clean usable line instead of refusing.
- If many posts are near-duplicates about “want followers / want 1000 fans / who needs followers”, vary the comments so they do not look machine-stamped.
- Favor comments that feel like a real person paused, understood, and added one notch of insight.

## Continuation Rule

After delivering a batch, assume the next step is:
- wait for the user to say “继续” or “下一页”
- then read the next page and repeat

If the user says “小红书自动评论”, resume this workflow directly without re-explaining it unless something changed.
