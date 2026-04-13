# Law Assistant 可直接接入大模型接口文档

日期：2026-04-10  
适用范围：Law Assistant MVP 后端接入真实大模型  
目标读者：后端开发、前端联调、模型接入开发

## 1. 这份文档解决什么问题

这不是一份“原则说明”，而是一份可以直接按步骤接入大模型的工程文档。

它回答 5 个实际问题：

1. 当前项目里应该改哪几个文件
2. 后端如何调用真实大模型
3. `/api/ask` 请求和响应格式是什么
4. 大模型应该返回什么结构
5. 配置项、错误处理和落地步骤是什么

本项目的核心原则不变：

- 这不是 chat app
- 前端不渲染聊天气泡
- 后端必须返回结构化学习结果
- 大模型只负责“生成结构化内容”

---

## 2. 当前项目中需要改的地方

本次真实大模型接入只涉及后端问答生成链路。

相关文件：

- `backend/app/api/ask.py`
- `backend/app/schemas/ask.py`
- `backend/app/services/llm_service.py`
- `backend/app/config.py`

当前状态：

- `POST /api/ask` 已存在
- `llm_service.py` 现在还是 mock 返回
- 前端已经依赖结构化 JSON

接入真实大模型后：

1. 不新增聊天接口
2. 不改 `/api/ask` 的前端调用方式
3. 只替换 `llm_service.py` 的内部实现
4. 保留现有 `LearningResultResponse` schema

---

## 3. 最终目标接口

### 3.1 接口

`POST /api/ask`

### 3.2 请求

```http
POST /api/ask
Content-Type: application/json
```

```json
{
  "question": "什么是不安抗辩权？"
}
```

### 3.3 返回

```json
{
  "question": "什么是不安抗辩权？",
  "concept": "不安抗辩权是指双务合同中，应当先履行债务的一方，有确切证据证明对方丧失或者可能丧失履行能力时，可以中止履行。",
  "elements": [
    "双方存在双务合同关系",
    "一方负有先履行义务",
    "有确切证据证明对方履行能力明显下降",
    "在对方恢复履行能力或提供担保前可以中止履行"
  ],
  "example": "例如甲乙签订买卖合同，甲应先交货，但甲发现乙公司经营严重恶化并拖欠多笔债务，此时甲可以暂时停止交货。",
  "mistakes": [
    "把不安抗辩权和先履行抗辩权混淆",
    "没有确切证据时不能随意中止履行"
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
```

这份结构必须保持稳定，因为前端已经围绕它来渲染学习模块。

---

## 4. 推荐接入方式

推荐使用：

**OpenAI-Compatible Chat Completions 接口**

原因：

1. 兼容大多数国内外模型网关
2. 未来切换模型提供商成本最低
3. 不需要前端感知模型差异

也就是说，后端统一调用一个兼容 OpenAI 格式的 HTTP 接口，例如：

```text
POST {LLM_BASE_URL}/chat/completions
```

请求头：

```http
Authorization: Bearer {LLM_API_KEY}
Content-Type: application/json
```

---

## 5. 配置项

建议把以下配置放进环境变量，并由 `backend/app/config.py` 读取：

```env
LLM_ENABLED=true
LLM_PROVIDER=openai_compatible
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://your-llm-gateway.example.com/v1
LLM_MODEL=your-model-name
LLM_TIMEOUT_SECONDS=30
LLM_TEMPERATURE=0.2
```

字段说明：

- `LLM_ENABLED`
  - 是否启用真实大模型
  - `false` 时仍可走 mock，便于本地开发

- `LLM_PROVIDER`
  - 当前建议固定为 `openai_compatible`

- `LLM_API_KEY`
  - 上游模型服务密钥

- `LLM_BASE_URL`
  - 兼容 OpenAI 风格的基础地址
  - 例：`https://xxx/v1`

- `LLM_MODEL`
  - 实际使用的模型名称

- `LLM_TIMEOUT_SECONDS`
  - 模型请求超时

- `LLM_TEMPERATURE`
  - 建议较低，保证结构稳定

---

## 6. 推荐修改 `config.py`

当前 `backend/app/config.py` 只有数据库配置。  
建议改成如下形态：

```python
import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'law_assistant.db'}"

LLM_ENABLED = os.getenv("LLM_ENABLED", "false").lower() == "true"
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai_compatible")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "")
LLM_MODEL = os.getenv("LLM_MODEL", "")
LLM_TIMEOUT_SECONDS = int(os.getenv("LLM_TIMEOUT_SECONDS", "30"))
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))
```

---

## 7. 推荐修改 `requirements.txt`

当前后端依赖里还没有 HTTP 客户端。  
建议增加：

```txt
httpx
```

这样 `llm_service.py` 可以直接发起模型请求。

---

## 8. 大模型调用协议

### 8.1 上游请求地址

```text
POST {LLM_BASE_URL}/chat/completions
```

### 8.2 上游请求体

建议请求体如下：

```json
{
  "model": "your-model-name",
  "temperature": 0.2,
  "messages": [
    {
      "role": "system",
      "content": "你是一个法律学习助手。你不是聊天机器人。你必须返回严格 JSON，字段包括 question、concept、elements、example、mistakes、statutes、confusions。不要输出 markdown，不要输出额外解释。"
    },
    {
      "role": "user",
      "content": "请解释这个法律问题，并返回严格 JSON：什么是不安抗辩权？"
    }
  ],
  "response_format": {
    "type": "json_object"
  }
}
```

说明：

1. `temperature` 建议低一些
2. `response_format` 优先要求 JSON
3. 即使上游模型支持 JSON mode，后端仍然必须做解析和兜底

---

## 9. 服务层最终目标

`backend/app/services/llm_service.py` 最终应该变成：

1. 负责组装 prompt
2. 负责调用模型
3. 负责解析结构化 JSON
4. 负责兜底和校验
5. 最终返回 `LearningResultResponse`

推荐保留的函数签名：

```python
def generate_learning_result(question: str) -> LearningResultResponse:
    ...
```

---

## 10. 可直接落地的 `llm_service.py` 参考实现

下面是可以直接按项目结构接入的参考版本。

```python
import json

import httpx

from app.config import (
    LLM_API_KEY,
    LLM_BASE_URL,
    LLM_ENABLED,
    LLM_MODEL,
    LLM_TEMPERATURE,
    LLM_TIMEOUT_SECONDS,
)
from app.schemas.ask import ConfusionItem, LearningResultResponse


SYSTEM_PROMPT = """
你是一个法律学习助手。
你不是聊天机器人。
你必须返回严格 JSON。

返回字段必须包括：
- question: string
- concept: string
- elements: string[]
- example: string
- mistakes: string[]
- statutes: string[]
- confusions: [{ "term": string, "difference": string }]

要求：
1. 使用中文
2. 面向法律学习者
3. 表达清晰、简洁、结构化
4. 不要输出 markdown
5. 不要输出 JSON 以外的任何内容
""".strip()


def _mock_result(question: str) -> LearningResultResponse:
    return LearningResultResponse(
        question=question,
        concept="这里保留原来的 mock 内容",
        elements=["示例要点 1", "示例要点 2"],
        example="示例案例",
        mistakes=["示例误区"],
        statutes=["示例法条"],
        confusions=[
            ConfusionItem(term="示例概念", difference="示例区别"),
        ],
    )


def _build_user_prompt(question: str) -> str:
    return f"请解释这个法律问题，并返回严格 JSON：{question}"


def _call_llm(question: str) -> dict:
    payload = {
        "model": LLM_MODEL,
        "temperature": LLM_TEMPERATURE,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(question)},
        ],
        "response_format": {"type": "json_object"},
    }

    with httpx.Client(timeout=LLM_TIMEOUT_SECONDS) as client:
        response = client.post(
            f"{LLM_BASE_URL.rstrip('/')}/chat/completions",
            headers={
                "Authorization": f"Bearer {LLM_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    return json.loads(content)


def _to_response(question: str, raw: dict) -> LearningResultResponse:
    confusions = []
    for item in raw.get("confusions", []):
        if not isinstance(item, dict):
            continue
        confusions.append(
            ConfusionItem(
                term=str(item.get("term", "")).strip(),
                difference=str(item.get("difference", "")).strip(),
            )
        )

    return LearningResultResponse(
        question=str(raw.get("question") or question).strip(),
        concept=str(raw.get("concept", "")).strip(),
        elements=[str(x).strip() for x in raw.get("elements", []) if str(x).strip()],
        example=str(raw.get("example", "")).strip(),
        mistakes=[str(x).strip() for x in raw.get("mistakes", []) if str(x).strip()],
        statutes=[str(x).strip() for x in raw.get("statutes", []) if str(x).strip()],
        confusions=confusions,
    )


def generate_learning_result(question: str) -> LearningResultResponse:
    normalized = question.strip()

    if not LLM_ENABLED:
        return _mock_result(normalized)

    raw = _call_llm(normalized)
    return _to_response(normalized, raw)
```

这份实现的重点是：

1. 与当前项目结构兼容
2. 前端不需要改
3. mock 和真实模型可切换
4. 输出固定为 `LearningResultResponse`

---

## 11. `ask.py` 的处理原则

`backend/app/api/ask.py` 原则上不需要大改，只需要继续调用：

```python
generate_learning_result(request.question)
```

也就是说：

- API 层不直接碰模型 HTTP 调用
- API 层只做参数校验与返回
- 模型错误由服务层抛出，再由 API 层转成 HTTP 错误

---

## 12. 错误处理

### 12.1 参数错误

状态码：

`422`

适用：

- question 为空
- 数据结构不合法

### 12.2 大模型上游不可用

状态码建议：

`502 Bad Gateway`

返回：

```json
{
  "detail": "LLM service unavailable"
}
```

### 12.3 模型输出不可解析

状态码建议：

`500 Internal Server Error`

返回：

```json
{
  "detail": "Failed to parse structured learning result"
}
```

### 12.4 建议做的兜底

模型返回不稳定时，服务层至少要：

1. 用原问题补 `question`
2. 空数组字段兜底为空数组
3. `confusions` 兜底为空列表
4. 任何关键字段缺失时记录日志

---

## 13. 本地联调步骤

### 第一步：安装依赖

```bash
cd /home/qisen/projects/law-assistant/backend
pip install -r requirements.txt
pip install httpx
```

如果你把 `httpx` 写进 `requirements.txt`，就只需要第一条。

### 第二步：配置环境变量

例如：

```bash
export LLM_ENABLED=true
export LLM_PROVIDER=openai_compatible
export LLM_API_KEY=your_api_key
export LLM_BASE_URL=https://your-llm-gateway.example.com/v1
export LLM_MODEL=your-model-name
export LLM_TIMEOUT_SECONDS=30
export LLM_TEMPERATURE=0.2
```

### 第三步：启动后端

```bash
cd /home/qisen/projects/law-assistant/backend
uvicorn app.main:app --reload --port 8000
```

### 第四步：验证接口

```bash
curl -X POST "http://127.0.0.1:8000/api/ask" \
  -H "Content-Type: application/json" \
  -d '{"question":"什么是不安抗辩权？"}'
```

如果接入成功，你应该看到结构化 JSON，而不是 mock 结果。

---

## 14. 与其他接口的关系

### `POST /api/notes`

这个接口不直接调用大模型。  
它接收 `/api/ask` 的结果，保存结构化笔记。

### `GET /api/notes`

纯数据读取接口，不依赖大模型。

### `GET /api/notes/{id}`

纯详情读取接口，不依赖大模型。

所以当前真正要接模型的链路只有：

```text
Frontend
-> POST /api/ask
-> llm_service.py
-> 上游大模型
-> 结构化 JSON
-> Frontend
```

---

## 15. 推荐实施顺序

1. 在 `config.py` 增加模型配置
2. 在 `requirements.txt` 增加 `httpx`
3. 用本文档中的参考版本替换 `llm_service.py`
4. 保持 `ask.py` 和 schema 不变
5. 本地 `curl` 验证 `/api/ask`
6. 前端联调

---

## 16. 文档位置与和其他文档的关系

本文件路径：

`docs/api/2026-04-10-llm-integration-api.md`

它和现有文档的关系是：

- `README.md`
  - 项目总览、运行方式、当前接口入口

- `docs/superpowers/specs/*.md`
  - 产品设计、页面设计、交互设计

- `docs/superpowers/plans/*.md`
  - 设计后的实现计划

- `docs/api/*.md`
  - 工程接口文档、前后端协议、第三方能力接入

所以这份文档属于：

**工程接入文档**

它不负责设计页面，而是负责告诉开发者：

**现在应该怎么把真实大模型接进项目。**
