# Law Assistant MVP

最小可用的 AI 法律学习助手。

当前仓库重点包含：

- `frontend/`：Vue 3 前端
- `backend/`：FastAPI MVP 后端

## Backend MVP

后端只覆盖最小核心闭环：

1. 用户提交一个法律问题
2. 后端返回结构化学习结果
3. 用户把结构化结果保存为笔记
4. 前端拉取笔记列表和笔记详情

当前不包含：

- 登录鉴权
- 流式输出
- 真实大模型接入
- 部署配置

## Backend Project Structure

```text
backend/
  app/
    main.py
    api/
      ask.py
      notes.py
    schemas/
      ask.py
      notes.py
    services/
      llm_service.py
      note_service.py
    models/
      note.py
    db/
      base.py
      session.py
      init_db.py
    config.py
  requirements.txt
```

## Dependencies

- `fastapi`
- `uvicorn[standard]`
- `sqlalchemy`
- `pydantic`
- SQLite（Python 内置驱动）
- `chromadb`

## Install

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

如果希望启用 RAG 检索，还需要在 `backend/.env` 中配置：

```bash
LLM_ENABLED=true
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
CHROMA_PERSIST_DIR=backend/data/chroma
```

## Run Server

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

访问：

- API 文档：http://127.0.0.1:8000/docs
- 健康检查：http://127.0.0.1:8000/health

## Minimal RAG

法律文本源目录固定为仓库根目录下的 `data/laws/`。

- 示例文件：`data/laws/sample_contract_law.txt`
- Chroma 本地索引目录：`backend/data/chroma/`

### Ingest Documents

首次构建索引：

```bash
cd backend
source .venv/bin/activate
python -m app.rag.ingest
```

该命令会读取 `data/laws/*.txt`，按约 500 字切块，生成 embeddings，并写入 `backend/data/chroma/`。

### Rebuild The Index

当前 ingestion 命令默认会重建整个集合，所以重复执行同一条命令即可：

```bash
cd backend
source .venv/bin/activate
python -m app.rag.ingest
```

### Run The Retriever

```bash
cd backend
source .venv/bin/activate
python -m app.rag.retriever "什么是不安抗辩权？"
```

### Run Backend With RAG Enabled

1. 先执行一次 ingestion，确保 Chroma 中已有向量。
2. 确认 `backend/.env` 已配置 `LLM_ENABLED=true`、`OPENAI_EMBEDDING_MODEL`、`CHROMA_PERSIST_DIR` 以及现有的 LLM 连接参数。
3. 启动后端：

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

当索引为空或检索失败时，`/api/ask` 会自动回退到原有的非 RAG 提问流程，不会改变外部请求或响应结构。

## Database Initialization

不需要单独执行初始化命令。

应用启动时会自动创建 SQLite 数据库和表：

- 数据库文件：`backend/law_assistant.db`

## Example Requests

### 1. Ask a Question

```bash
curl -X POST "http://127.0.0.1:8000/api/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "什么是不安抗辩权？"
  }'
```

### 2. Save a Note

```bash
curl -X POST "http://127.0.0.1:8000/api/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "不安抗辩权",
    "question": "什么是不安抗辩权？",
    "summary": "不安抗辩权是在双务合同中，先履行一方在有证据证明对方履约能力下降时可中止履行。",
    "tags": ["合同法", "民法典"],
    "content": {
      "concept": "不安抗辩权是指双务合同中，应当先履行债务的一方，有确切证据证明对方丧失或者可能丧失履行能力时，可以中止履行。",
      "elements": [
        "双方存在双务合同关系",
        "一方负有先履行义务"
      ],
      "example": "例如甲乙签订买卖合同，甲应先交货，但甲发现乙公司经营严重恶化并拖欠多笔债务，此时甲可以暂时停止交货。",
      "mistakes": [
        "把不安抗辩权和先履行抗辩权混淆"
      ],
      "statutes": [
        "《中华人民共和国民法典》第五百二十七条"
      ],
      "confusions": [
        {
          "term": "先履行抗辩权",
          "difference": "先履行抗辩权针对对方到期债务未履行，不安抗辩权针对对方履约能力明显下降。"
        }
      ]
    }
  }'
```

### 3. List Notes

```bash
curl "http://127.0.0.1:8000/api/notes"
```

### 4. Get Note Detail

```bash
curl "http://127.0.0.1:8000/api/notes/1"
```
