# Law Assistant MVP

最小可用的 AI 法律学习助手。

仓库分为两部分：

- `frontend/`：Vue 3 前端
- `backend/`：FastAPI 后端实现

但后端启动入口已经统一到仓库根目录。也就是说，在 `law-assistant/` 下可以直接执行：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Quick Start

工作目录固定为仓库根目录 `law-assistant/`。

### 1. 安装依赖

如果你使用系统 Python：

```bash
pip install -r requirements.txt
```

如果你使用 `uv`：

```bash
uv sync
```

`.venv/` 不是必需的，可以删除，不影响根目录启动方式。

### 2. 启动后端

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

访问：

- API 文档：http://127.0.0.1:8000/docs
- 健康检查：http://127.0.0.1:8000/health

## Make + systemd

如果服务器没有 Docker，可以直接使用仓库自带的 `Makefile` 和 `systemd` 模板，一次性启动前后端并支持宕机自动重启、开机自启。

在仓库根目录执行：

```bash
make up
```

它会做这些事：

1. 安装后端依赖：`pip install -r requirements.txt`
2. 安装前端依赖：`cd frontend && npm install`
3. 生成 systemd service 文件到 `.systemd/`
4. 安装 service 文件到 `/etc/systemd/system/`
5. 执行 `systemctl enable`
6. 启动前后端服务

常用命令：

```bash
make status
make logs
make restart
make down
```

当前默认服务：

- 后端：`uvicorn main:app --host 0.0.0.0 --port 8000`
- 前端：`cd frontend && npm run dev -- --host 0.0.0.0 --port 5173`

生成的模板文件位置：

```text
deploy/systemd/law-assistant-backend.service.template
deploy/systemd/law-assistant-frontend.service.template
```

## Environment

后端环境变量文件位置仍然是：

```text
backend/.env
```

如果希望启用 RAG 检索，需要配置：

```bash
LLM_ENABLED=true
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
CHROMA_PERSIST_DIR=backend/data/chroma
```

## Minimal RAG

法律文本源目录固定为：

```text
data/laws/
```

- 示例文件：`data/laws/sample_contract_law.txt`
- Chroma 本地索引目录：`backend/data/chroma/`

### Ingest Documents

在仓库根目录执行：

```bash
python -m app.rag.ingest
```

该命令会读取 `data/laws/*.txt`，按约 500 字切块，生成 embeddings，并写入 `backend/data/chroma/`。

### Rebuild The Index

重复执行同一条命令即可：

```bash
python -m app.rag.ingest
```

### Run The Retriever

```bash
python -m app.rag.retriever "什么是不安抗辩权？"
```

## Database Initialization

不需要单独执行初始化命令。应用启动时会自动创建 SQLite 数据库和表：

- 数据库文件：`backend/law_assistant.db`

## Project Structure

```text
law-assistant/
  main.py                  # 根目录 ASGI 入口，支持 uvicorn main:app
  requirements.txt         # 根目录依赖入口
  backend/
    app/
      main.py              # FastAPI 应用定义
      api/
      schemas/
      services/
      models/
      db/
      rag/
      config.py
  frontend/
    src/
```
