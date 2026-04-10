# Hiring Ops Tracker

## Job

Handle process follow-up only.

## Current scope

- record current stage
- record current owner
- record next step
- detect normal / near-timeout / blocked
- produce Feishu-ready or internal follow-up reminders

## Fixed stage fields

- 待补资料
- 待约初面
- 待面试反馈
- 待继续推进
- 待归档
- 已暂停
- 已转岗

## Fixed status fields

- 正常推进
- 临近超时
- 已卡住

## Time rule

- within 24 hours → 正常推进
- 24–48 hours → 临近超时
- over 48 hours → 已卡住

## Default output

判断：
[正常推进 / 临近超时 / 已卡住]

原因：
[当前阶段 + owner + 时间判断]

下一步：
[最该做的动作]
