# 文档

## 发布指南

### Agent 发布流程

1. 准备 Agent 配置（JSON 格式）
2. 调用 `POST /api/admin/templates` 创建
3. 设置 `is_published: true` 上架
4. 等待审核通过

### Skill 发布流程

1. 确保 SKILL.md 格式正确（YAML frontmatter）
2. 打包为 tar.gz
3. 使用统一发布接口 `POST /api/admin/templates/publish-with-skills`

## API 端点

- `GET /api/admin/templates` - 查询 Agent 列表
- `POST /api/admin/templates` - 创建 Agent
- `PUT /api/admin/templates/:id` - 更新 Agent
- `POST /api/admin/templates/:id/publish` - 发布/下架
- `POST /api/admin/stories/bulk-import` - 发布故事

## 市场链接

- 市场首页: https://my.talentclaw.ai/market
- Agent 管理: https://my.talentclaw.ai/admin/templates
- 故事管理: https://my.talentclaw.ai/admin/stories
