---
name: visual-vocab-builder
description: '上传图片，AI自动识别画面物体并标注英文词汇（含音标、词性、中文翻译、例句），生成文学风格场景描述，支持TTS朗读。'
metadata:
  {
    "openclaw": { "emoji": "🎨", "requires": { "anyBins": ["npm", "node"] } },
  }
---

# Visual Vocab Builder — Skill 手册

## 项目简介

上传一张图片，AI（Gemini）自动识别画面中的物体，打上英文词汇标注（含音标、词性、中文翻译、例句），并生成一段文学风格的场景描述，支持 TTS 朗读。

**技术栈**：React 19 + Vite + Tailwind CSS + @google/genai

---

## 环境要求

- Node.js（建议 v18+）
- 有效的 Gemini API Key（从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取）

---

## 启动步骤

### 第一次运行

```bash
# 1. 进入项目目录
cd /Users/tricia/Downloads/visual-vocab-builder

# 2. 安装依赖
npm install

# 3. 创建环境变量文件
cp .env.example .env.local

# 4. 编辑 .env.local，填入真实的 Gemini API Key
#    将 MY_GEMINI_API_KEY 替换为你的 key
#    GEMINI_API_KEY="AIza..."

# 5. 启动开发服务器
npm run dev
```

### 后续运行（依赖已安装）

```bash
cd /Users/tricia/Downloads/visual-vocab-builder && npm run dev
```

---

## 访问地址

启动成功后，浏览器打开：

```
http://localhost:3000
```

---

## 环境变量说明

| 变量名 | 是否必填 | 说明 |
|--------|----------|------|
| `GEMINI_API_KEY` | **必填** | Gemini API 密钥，用于图片分析和 TTS |
| `APP_URL` | 可选 | 部署时使用，本地开发不需要 |

`.env.local` 文件不会被 git 追踪（已在 `.gitignore` 中），每台机器需单独配置。

---

## 常见问题

**Q: 启动后页面报错 "The muse is silent"**  
A: Gemini API Key 未配置或无效，检查 `.env.local` 中的 `GEMINI_API_KEY`。

**Q: `npm install` 报错**  
A: 确认 Node.js 版本 ≥ 18，运行 `node -v` 查看。

**Q: 端口 3000 被占用**  
A: 修改 `package.json` 中 `dev` 命令的 `--port=3000` 为其他端口，如 `--port=3001`。

---

## 项目结构

```
visual-vocab-builder/
├── src/
│   ├── App.tsx          # 主应用逻辑（图片上传、AI 分析、词汇展示）
│   ├── main.tsx         # 入口
│   ├── types.ts         # TypeScript 类型定义
│   └── lib/utils.ts     # 工具函数
├── index.html           # HTML 入口
├── vite.config.ts       # Vite 配置
├── package.json         # 依赖和脚本
├── .env.example         # 环境变量模板
└── SKILL.md             # 本文件
```

---

## 给 Agent 的快速指令

如果你是 Agent，需要帮用户启动这个项目，执行以下操作：

1. 检查 `.env.local` 是否存在且包含有效的 `GEMINI_API_KEY`
2. 如不存在，提示用户提供 API Key，然后创建 `.env.local`
3. 运行 `npm install`（如 `node_modules` 不存在）
4. 运行 `npm run dev`
5. 告知用户访问 `http://localhost:3000`
