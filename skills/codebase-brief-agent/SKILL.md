---
name: codebase-brief-agent
description: Turn a GitHub repo, local codebase, or current project into an operator-friendly brief. Use when the user wants to understand what a codebase does, how it is structured, where to edit specific features, what the main risks are, or how to hand off / review / maintain a project without reading every file. Best for founders, PMs, operators, and vibe coders who need practical codebase understanding rather than a programming course.
---

# Codebase Brief Agent

Turn a codebase into a practical operating brief.

Do not optimize for classroom-style teaching. Optimize for decision support, handoff, maintenance, and fast understanding.

## Core workflow

### 1. Scope the codebase
Accept:
- GitHub repo link
- local folder path
- current project

If the codebase is large, identify the smallest meaningful scope first:
- core app path
- entry points
- main services
- key UI flows

Do not pretend to read everything when the repo is large. State the scope you actually analyzed.

### 2. Build a practical understanding model
Extract these six things:
- what the product does
- who the main modules are
- how data or requests flow through the system
- where key features are implemented
- what looks fragile or risky
- what someone should read first to take over the project

Read `references/output-frames.md` to choose the right output frame.

### 3. Produce one of three brief types
Choose the most useful default for the user request:

#### A. Executive Brief
Use for founders, PMs, or operators.
Output:
- product purpose
- architecture snapshot
- critical modules
- where to change common features
- major risks
- recommended next actions

#### B. Change Map
Use when the user asks "where do I edit X" or wants implementation guidance.
Output:
- likely files to edit
- dependencies affected
- risk of breakage
- test areas to verify

#### C. Handoff Brief
Use when the user needs to transfer ownership, review a repo, or onboard another person.
Output:
- what to read first
- system boundaries
- operational gotchas
- known debt
- first-week reading plan

### 4. Show evidence, not fluff
Ground every major claim in repo evidence:
- filenames
- folders
- entrypoints
- config files
- concrete implementation paths

Do not say "the app likely" unless confidence is truly low.

### 5. Prefer decision usefulness over completeness
A useful brief answers:
- what is this system
- where do important things live
- what will break if we touch this
- what should we do next

A useless brief is long, generic, and reads like an auto-generated tutorial.

## Output rules

### Required sections
Every brief should include:
1. What this codebase appears to do
2. Architecture in plain language
3. Critical modules and why they matter
4. Where to edit common changes
5. Risks / fragility points
6. Recommended next actions

### Optional section
Include "Read first" when useful:
- README
- package manifest
- main entrypoints
- env/config files
- routing layer
- database schema

## Heuristics

### For web apps
Look for:
- app entrypoint
- routing
- API layer
- auth
- persistence
- deployment config

### For extensions
Look for:
- manifest
- background scripts
- content scripts
- UI pages
- permissions

### For scripts / pipelines
Look for:
- orchestrator script
- inputs / outputs
- state tracking
- external APIs
- scheduling

## What not to do
- Do not turn everything into a lesson plan
- Do not over-focus on visuals unless the user asked for a course or tutorial
- Do not claim certainty when repo exploration was partial
- Do not bury the answer under generic CS explanations

## Good default phrasing
- "If you need to change X, start with these files..."
- "The highest-risk part of this repo appears to be..."
- "If I were onboarding a new owner, I would have them read these files first..."
- "This system seems to rely heavily on..."
