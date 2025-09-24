# ai-text-detector

一个基于 React + Vite 的单页应用，用于检测输入文本是否由 AI 生成。结合文本统计、困惑度曲线、大模型裁判和 green-list 相似度评分。

主要功能

- 文本输入（粘贴 / .txt 上传）
- 基础统计（词频 / 标点 / 句长）并可视化
- 使用 DeepSeek 计算困惑度并绘制曲线
- 使用 DeepSeek 作为大模型裁判，返回 AI 概率与说明
- 本地 green-list 相似度比对（embedding / 余弦相似度）

目录结构（简要）

- `src/components/` - React 组件
- `src/utils/` - 工具函数（文本统计、困惑度、裁判、green-list）
- `src/pages/ResultPage.tsx` - 主页面
- `server/` - 可选代理，用于安全转发 DeepSeek API 请求

本地开发

1. 前端（在项目根目录）

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

2. 后端代理（可选）

代理用于在服务器端保存 DeepSeek API Key，并将前端请求安全转发给 DeepSeek。进入 `server/` 并安装依赖后启动：

```bash
cd server
npm install express node-fetch body-parser dotenv
node index.js
```

环境变量（示例）

在项目根目录创建 `.env`（不要将实际 API Key 提交到仓库）：

```
# server/.env 或 部署环境变量
DEEPSEEK_BASE_URL=https://api.deepseek.example
DEEPSEEK_API_KEY=sk-xxxx
PORT=5173

# 前端（Vite）可选：
VITE_DEEPSEEK_API_URL=/api/deepseek
VITE_DEEPSEEK_API_KEY=
VITE_DEEPSEEK_EMBED_URL=/api/deepseek/embedding
```

部署说明

- 将 `server` 部署到可信任的后端环境（如 VPS、Cloud Run、Heroku、或云函数），并通过环境变量注入 `DEEPSEEK_API_KEY`。
- 前端通过代理 `/api/deepseek/*` 发送请求到后端代理。

注意事项

- 不要在前端直接暴露 DeepSeek API Key。若需要在本地测试，可以把 `VITE_DEEPSEEK_API_KEY` 写入 `.env`，但上线前应移除。
- DeepSeek 的响应格式可能与本示例代码假设略有不同，请根据实际 API 文档调整 `src/utils/perplexity.ts`、`src/utils/modelJudge.ts` 和 `src/utils/greenList.ts` 中的解析逻辑。

下一步建议

- 根据 DeepSeek 的真实返回字段调整解析逻辑
- 为 green-list embedding 添加缓存以减少重复请求
- 添加单元测试与 CI


