---
name: meeting-action-engine
description: Turn meeting notes, transcripts, Feishu/Lark docs, or minutes links into reviewed action plans and completed follow-through. Use when the user shares a meeting recap, transcript, Feishu doc, or asks to extract action items, assign owners, draft follow-ups, create docs, schedule reminders, or turn discussion into execution. Best for post-meeting execution, not generic summarization.
---

# Meeting Action Engine

Turn meeting content into execution.

Do not stop at summary. Extract concrete actions, identify owner and deadline, show a compact execution plan, then perform the approved items using available tools.

## Workflow

### 1. Normalize the input
Accept any of these:
- raw transcript or notes pasted in chat
- Feishu doc link
- Feishu wiki link pointing to meeting notes
- meeting recap document

If the user provides a Feishu doc or wiki link, read it first with Feishu tools. If the content references a transcript, minutes, or follow-up doc, fetch those too before analyzing.

### 2. Extract only execution-relevant items
Ignore generic meeting summary unless it helps execution.

For each action item, capture:
- title
- what must happen
- proposed owner
- due date or urgency, if known
- evidence, a short quote or reason from the notes
- execution type

Use these execution types:
- message
- document
- reminder
- research
- review
- coordination
- manual

Read `references/action-taxonomy.md` when classification is ambiguous.

### 3. Produce a compact action table
Before doing anything irreversible, show a numbered list or compact table with:
- item
- owner
- due date
- what the agent can do next
- whether approval is required

Keep it scannable. Default to 3 sections:
- agent can do now
- needs user choice
- user must do personally

### 4. Ask for execution approval
Never send messages or create reminders silently unless the user clearly asked for that already.

Good approval prompts:
- "I can do 1, 2, and 4 now. Want me to proceed?"
- "Reply with item numbers to execute, for example: 1 2 4"
- "Say 'all' to execute every agent-owned item"

### 5. Execute with the smallest reliable toolset
Prefer first-class tools over shell commands.

Typical mappings:
- message follow-up -> `message`
- create or append meeting follow-up doc -> `feishu_doc`
- turn dated follow-up into a reminder -> `cron`
- fetch context from a URL -> `web_fetch`
- look up external facts -> `web_search`
- send progress updates across sessions -> `sessions_send`

When a first-class tool is unavailable for a specific external system, draft the output cleanly for the user instead of pretending execution succeeded.

### 6. Report completed work clearly
After execution, report only:
- what was done
- what artifacts were created
- what still needs input
- what is blocked

## Decision rules

### Prefer execution over elegance
If the meeting says "send them the memo," the best output is a ready-to-send message or created doc, not a paragraph about communication strategy.

### Be strict about ownership
Do not assign work vaguely. If owner is unclear, mark it explicitly as `owner unclear` and ask.

### Be strict about deadlines
If no due date is stated, infer urgency only when evidence is strong. Otherwise mark `no explicit deadline`.

### Separate extraction from action
First identify everything. Then execute only the approved subset.

### Avoid fake completion
If a task needs human judgment, external credentials, or a system you cannot reach, mark it as blocked or manual. Offer the next-best artifact, such as a drafted message, checklist, or reminder.

## Output shape

Use this structure by default:

### Action Plan
1. [Title]  
   Owner: ...  
   Due: ...  
   Agent next step: ...  
   Evidence: ...

### Ready to execute
- 1, 3, 4

### Need your choice
- 2, because owner or destination is unclear

### Manual
- 5, because it requires your judgment

## Feishu handling

When the input is a Feishu doc or wiki page:
1. read the source
2. detect whether the notes already contain explicit action items
3. if not, infer action items from decisions and commitments
4. if asked to write back, create a follow-up doc or append a structured action section

## What not to do
- Do not produce a long decorative summary before the action plan
- Do not mark items as done before tools succeed
- Do not send external messages without approval
- Do not bury unclear ownership or missing deadlines
