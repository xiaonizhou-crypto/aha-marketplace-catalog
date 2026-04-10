---
name: hiring-loop
description: "Minimal hiring workflow skill for resume screening, candidate coordination, and hiring ops tracking. Use when building or running a lightweight hiring loop under one main OpenClaw entry, especially for: (1) first-pass resume screening, (2) request-more-info and interview scheduling messages, (3) candidate reply summaries for Feishu, (4) stage/owner/next-step tracking, and (5) blocked or timeout follow-up reminders."
---

# Hiring Loop

Use this skill to run a minimal hiring loop under one main entry.

## What this skill contains

This is one skill with three sub-capabilities:
- **Resume Screener** — first-pass resume screening
- **Candidate Coordinator** — request-more-info, interview scheduling, candidate reply summary
- **Hiring Ops Tracker** — current stage, owner, next step, blocked status

## Fixed workflow

Run the flow in this order:

Resume in  
→ Resume Screener  
→ Candidate Coordinator  
→ Hiring Ops Tracker  
→ Feishu update

## Fixed rules

### Stage fields
- 待补资料
- 待约初面
- 待面试反馈
- 待继续推进
- 待归档
- 已暂停
- 已转岗

### Status fields
- 正常推进
- 临近超时
- 已卡住

### Time rule
- within 24 hours → 正常推进
- 24–48 hours → 临近超时
- over 48 hours → 已卡住

## Default communication style

- concise
- human
- judgment first, then reason, then next step
- no long report
- no table voice
- suitable for HR, hiring manager, referrer, or operator

## How to use

### For resume screening
Read `references/resume-screener.md`.

### For candidate coordination
Read `references/candidate-coordinator.md`.

### For hiring ops tracking
Read `references/hiring-ops-tracker.md`.

### For Feishu write-back fields
Read `references/feishu.md`.

### For example flows
Read files in `references/examples/` as needed.
