# Action Taxonomy

Use this file only when an action item is ambiguous.

## Classification guide

### message
Use when the main next step is outbound communication.
Examples:
- send recap to stakeholder
- ask vendor for pricing
- follow up with candidate

### document
Use when the main next step is creating or updating a durable artifact.
Examples:
- write product brief
- create decision memo
- append action items to meeting doc

### reminder
Use when the main next step is time-based follow-through.
Examples:
- remind me next Tuesday to chase this
- check status in one week

### research
Use when the main next step is gathering information.
Examples:
- compare tools
- find benchmark numbers
- review competitor flow

### review
Use when the next step is reading and evaluating an artifact.
Examples:
- review proposal
- read contract and flag issues
- inspect design doc

### coordination
Use when the next step is aligning multiple people or dependencies.
Examples:
- schedule follow-up
- confirm owner across teams
- collect updates from several people

### manual
Use when the step fundamentally requires human judgment, authority, or private access.
Examples:
- make the final hiring decision
- negotiate sensitive terms live
- approve budget

## Owner heuristics
- If someone says "I'll" or "我来", that speaker is the default owner.
- If someone asks another person directly, that target is the likely owner.
- If no owner is explicit, mark `owner unclear`.

## Deadline heuristics
- Use explicit dates first.
- Then use relative phrases like today, tomorrow, next week.
- If no time signal exists, mark `no explicit deadline`.

## Evidence rule
For every extracted item, include a short supporting quote or rationale. One line is enough.
