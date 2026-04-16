# Law Assistant Vercel 部署文档

本文档面向当前仓库的实际状态，目标是说明：

- 这个项目准备如何部署到 Vercel
- 当前仓库里哪些部分可以直接上
- 哪些部分在正式上线前必须改造
- 推荐的部署顺序、环境变量和验收方式

适用仓库结构：

- `frontend/`：Vite + Vue 3 前端
- `backend/`：FastAPI 后端

## 1. 当前结论

当前仓库还不能直接作为“长期可用版本”无修改部署到 Vercel。

原因有三点：

1. 后端默认数据库是本地 SQLite  
   当前配置来自 [backend/app/config.py](/home/qisen/projects/law-assistant/backend/app/config.py:7)，默认使用 `backend/law_assistant.db`。Vercel 的函数运行环境不适合作为长期持久化数据库。

2. RAG 默认依赖本地 Chroma 持久化目录  
   当前配置来自 [backend/app/config.py](/home/qisen/projects/law-assistant/backend/app/config.py:35)，默认使用 `backend/data/chroma`。这同样不适合作为 Vercel 上的长期持久化方案。

3. 后端 CORS 目前只允许本地访问  
   当前 CORS 配置在 [backend/app/main.py](/home/qisen/projects/law-assistant/backend/app/main.py:18)，仅放行 `127.0.0.1` 和 `localhost`。

所以：

- 如果只是部署演示版，前端可以先单独部署
- 如果目标是长期使用，推荐先完成“数据库外置 + RAG 持久化外置 + 生产域名配置”后，再部署前后端

## 2. 推荐部署方案

推荐采用下面的长期方案：

- 前端：部署到 Vercel
- 后端：部署到 Vercel Python Runtime
- 业务数据库：Neon Postgres
- RAG 向量存储：`pgvector` 或其他托管向量库
- 大模型与 Embedding：继续使用当前兼容 OpenAI 的供应商

不推荐继续依赖：

- 本地 SQLite
- 本地 `backend/data/chroma`

### 推荐原因

1. 前端是标准 Vite 静态站点，和 Vercel 配合非常直接。
2. FastAPI 可以运行在 Vercel Python Runtime 上，官方支持基础用法。
3. Neon Postgres 更适合 Vercel 上的长期持久化。
4. 当前 RAG 已经完成本地 MVP 接线，但本地 Chroma 只适合开发验证，不适合正式上线。

## 3. 部署形态选择

当前仓库有两种主要部署形态。

### 方案 A：前后端拆成两个 Vercel 项目

推荐优先使用这个方案。

- 项目 1：`frontend/`
- 项目 2：`backend/`

优点：

- 配置简单
- 前后端构建逻辑清晰
- 出问题时更容易定位
- 不依赖 Vercel Services 的额外配置

缺点：

- 需要管理两个项目
- 前端需要显式配置 API 地址

### 方案 B：单个 Vercel 项目，前后端一起部署

可以做，但不建议作为第一版上线方案。

优点：

- 域名统一
- 路由看起来更整洁

缺点：

- 需要补充根目录 `vercel.json`
- 需要处理多服务构建和路由
- 当前仓库还没有现成的 Vercel Services 配置

本文档以下内容默认采用“方案 A：两个 Vercel 项目”。

## 4. 正式上线前必须完成的改造

### 4.1 数据库改造

目标：把 SQLite 改为外部 Postgres。

当前状态：

- 默认 `DATABASE_URL` 固定写为 SQLite 文件路径
- 这会导致线上数据无法稳定长期保存

建议改造为：

- 优先从环境变量读取 `DATABASE_URL`
- 未设置时，本地开发再回退到 SQLite

建议目标结构：

```python
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'law_assistant.db'}")
```

上线时：

- 本地开发继续可用
- Vercel 上通过环境变量注入 Neon Postgres 连接串

### 4.2 RAG 存储改造

目标：不要把 `backend/data/chroma` 当成正式环境持久化目录。

当前状态：

- ingestion 和 retrieval 本地已经能跑通
- 但当前向量数据写入本地目录 `backend/data/chroma`

长期建议：

- 方案 1：继续使用 Chroma，但迁移到独立持久化环境
- 方案 2：切换到 `pgvector`，统一使用 Postgres 管理结构化数据和向量数据

如果你的目标是长期使用，推荐优先考虑 `pgvector`。

### 4.3 后端生产域名配置

当前 CORS 仅允许本地：

```python
allow_origin_regex=r"^https?://(127\.0\.0\.1|localhost)(:\d+)?$"
```

部署前需要改成至少支持：

- 本地开发域名
- Vercel 预览域名
- Vercel 生产域名

建议做法：

- 用环境变量维护允许域名列表
- 本地和线上分别配置

### 4.4 前端 API 地址配置

当前前端默认 API 地址在 [frontend/src/lib/api.ts](/home/qisen/projects/law-assistant/frontend/src/lib/api.ts:4)：

```ts
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  'http://127.0.0.1:8000'
```

这意味着：

- 本地没问题
- 上线后必须在 Vercel 中配置 `VITE_API_BASE_URL`

如果前后端拆成两个项目：

- `VITE_API_BASE_URL=https://your-backend-project.vercel.app`

如果前后端未来合并成一个域名：

- 可以改成相对路径 `/api`

## 5. 推荐的实施顺序

推荐按下面顺序推进。

### 第一步：完成后端持久化改造

需要完成：

1. 数据库切到 Neon Postgres
2. SQLAlchemy 正常连接外部数据库
3. `init_db()` 在外部数据库可正常建表
4. 本地启动和线上环境都能使用同一套代码

验收标准：

- `POST /api/notes` 成功写入
- `GET /api/notes` 和 `GET /api/notes/{id}` 能返回外部数据库中的真实数据

### 第二步：完成 RAG 外置化

需要完成：

1. 确定正式向量存储方案
2. ingestion 不再依赖本地目录长期持久化
3. retriever 线上能查询真实索引

验收标准：

- 重新执行 ingestion 后，线上检索结果稳定可返回
- 重部署后向量数据不会消失

### 第三步：部署后端到 Vercel

后端项目部署目标：

- Runtime：Python
- 依赖来源：`backend/requirements.txt`
- 应用入口：FastAPI `app`

根据 Vercel 官方文档，FastAPI 可直接运行在 Vercel Python Runtime 上：

- FastAPI on Vercel  
  https://vercel.com/docs/frameworks/backend/fastapi
- Python Runtime  
  https://vercel.com/docs/functions/runtimes/python

部署前建议准备：

- `backend/requirements.txt`
- 生产环境变量
- 明确的入口文件

如果后续你希望直接从 `backend/` 作为独立项目部署，建议补一个简单的 Vercel 入口文件或按官方约定整理入口，避免自动检测不稳定。

### 第四步：部署前端到 Vercel

前端项目部署目标：

- Root Directory：`frontend`
- Framework Preset：Vite
- Build Command：`npm run build`
- Output Directory：`dist`

这部分当前仓库已经具备基础条件，且我已验证过前端构建可以通过。

### 第五步：联调和验收

至少验证以下路径：

1. 打开前端生产站点
2. 输入法律问题，请求成功到达后端
3. `/api/ask` 正常返回结构化结果
4. 点击保存后，笔记写入外部数据库
5. 刷新页面后，“我的笔记”仍能读取到真实数据
6. 如果开启 RAG，确认检索结果来自正式语料而不是本地示例文件

## 6. 环境变量清单

以下是当前项目上线时建议维护的环境变量。

### 后端

```bash
DATABASE_URL=postgresql://...
LLM_ENABLED=true
LLM_PROVIDER=openai_compatible
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://your-provider-compatible-endpoint
LLM_MODEL=your-chat-model
OPENAI_EMBEDDING_MODEL=your-embedding-model
LLM_TIMEOUT_SECONDS=30
LLM_TEMPERATURE=0.2
```

说明：

- `DATABASE_URL`：正式环境必须配置
- `OPENAI_EMBEDDING_MODEL`：必须与你的供应商兼容
- 当前本地验证中，DashScope 兼容接口可用的 embedding 模型配置为 `text-embedding-v4`

### 前端

```bash
VITE_API_BASE_URL=https://your-backend-project.vercel.app
```

## 7. 当前仓库的已知上线风险

### 风险 1：SQLite 仍是默认数据库

如果不改，会出现以下问题：

- 数据持久化依赖函数本地文件系统
- 重部署后不可控
- 不适合作为正式数据库

### 风险 2：本地 Chroma 仍是默认 RAG 存储

如果不改，会出现以下问题：

- 重部署或实例变化后，索引不可依赖
- 无法作为稳定线上向量库使用

### 风险 3：当前示例语料不足

当前 `data/laws/` 中的示例语料规模太小，且与许多目标问题不完全匹配。

这意味着：

- 即使 RAG 代码链路可用
- 检索效果也未达到正式可用水平

### 风险 4：`.env` 中存在真实密钥

当前仓库本地 `backend/.env` 中已经存在真实密钥。

上线前必须确认：

- 不要把真实密钥提交到 Git
- 所有生产密钥改由 Vercel Environment Variables 管理

## 8. 推荐的 Vercel 部署步骤

### 前端项目

1. 在 Vercel 中创建新项目
2. 选择当前仓库
3. Root Directory 设为 `frontend`
4. 配置环境变量：

```bash
VITE_API_BASE_URL=https://your-backend-project.vercel.app
```

5. 部署

### 后端项目

1. 在 Vercel 中再创建一个项目
2. 选择同一个仓库
3. Root Directory 设为 `backend`
4. 配置环境变量：

```bash
DATABASE_URL=postgresql://...
LLM_ENABLED=true
LLM_PROVIDER=openai_compatible
LLM_API_KEY=...
LLM_BASE_URL=...
LLM_MODEL=...
OPENAI_EMBEDDING_MODEL=...
LLM_TIMEOUT_SECONDS=30
LLM_TEMPERATURE=0.2
```

5. 部署
6. 部署后验证：

- `/health`
- `/docs`
- `/api/ask`
- `/api/notes`

## 9. 推荐的最小上线检查清单

上线前建议逐项确认：

- 前端 `npm run build` 成功
- 后端本地启动成功
- 后端已切换外部数据库
- 笔记读写在外部数据库上验证通过
- 生产 CORS 已放行 Vercel 域名
- 前端已配置 `VITE_API_BASE_URL`
- RAG 已决定是否上线
- 若上线 RAG，已完成正式向量存储方案

## 10. 下一步建议

如果你的目标是尽快把这个项目部署到 Vercel，同时保证后续能长期使用，推荐按这个顺序继续推进：

1. 先把 `DATABASE_URL` 改成环境变量优先
2. 把 SQLite 切到 Neon Postgres
3. 处理生产 CORS
4. 部署后端项目
5. 部署前端项目
6. 最后决定是否把 RAG 一并上线

如果你愿意，我下一步可以直接继续帮你做下面其中一项：

- 把后端改成 `DATABASE_URL` 环境变量优先，并兼容本地 SQLite
- 继续补一版 `vercel.json` 和后端入口文件，方便实际部署
