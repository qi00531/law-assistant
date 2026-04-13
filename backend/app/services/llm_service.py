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
from app.rag.retriever import retrieve_relevant_chunks
from app.schemas.ask import AskHistoryItem, ConfusionItem, LearningResultResponse, StatuteItem


class LLMServiceError(Exception):
    """Raised when the upstream LLM service is unavailable."""


class LLMParseError(Exception):
    """Raised when the LLM output cannot be parsed into the target schema."""


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
- statutes: [{ "title": string, "article": string, "content": string }]
- confusions: [{ "term": string, "difference": string }]

要求：
1. 使用中文
2. 面向法律学习者
3. 表达清晰、简洁、结构化
4. 不要输出 markdown
5. 不要输出 JSON 以外的任何内容
""".strip()


DEFAULT_RESULT = LearningResultResponse(
    question="什么是不安抗辩权？",
    concept="不安抗辩权是指双务合同中，应当先履行债务的一方，有确切证据证明对方丧失或者可能丧失履行能力时，可以中止履行。",
    elements=[
        "双方存在双务合同关系",
        "一方负有先履行义务",
        "有确切证据证明对方履行能力明显下降",
        "在对方恢复履行能力或提供担保前可以中止履行",
    ],
    example="例如甲乙签订买卖合同，甲应先交货，但甲发现乙公司经营严重恶化并拖欠多笔债务，此时甲可以暂时停止交货。",
    mistakes=[
        "把不安抗辩权和先履行抗辩权混淆",
        "没有确切证据时不能随意中止履行",
    ],
    statutes=[
        StatuteItem(
            title="《中华人民共和国民法典》",
            article="第五百二十七条",
            content="应当先履行债务的当事人，有确切证据证明对方有下列情形之一的，可以中止履行：经营状况严重恶化；转移财产、抽逃资金，以逃避债务；丧失商业信誉；有丧失或者可能丧失履行债务能力的其他情形。当事人没有确切证据中止履行的，应当承担违约责任。",
        )
    ],
    confusions=[
        ConfusionItem(
            term="先履行抗辩权",
            difference="先履行抗辩权针对对方到期债务未履行，不安抗辩权针对对方履约能力明显下降。",
        )
    ],
)


def _mock_result(question: str) -> LearningResultResponse:
    normalized = question.strip()

    if "表见代理" in normalized:
        return LearningResultResponse(
            question=normalized,
            concept="表见代理是指行为人实际上没有代理权，但因本人行为造成足以使相对人相信其有代理权的外观，从而使代理行为对本人发生效力。",
            elements=[
                "行为人没有真实代理权",
                "存在足以使相对人相信其有代理权的外观",
                "该外观可归责于本人",
                "相对人善意且无过失",
            ],
            example="例如公司长期允许员工以公司名义签订小额合同，后来该员工超越授权继续签约，相对人有理由相信其仍有代理权。",
            mistakes=[
                "把表见代理误认为无权代理的一般情形",
                "忽视相对人必须善意且无过失这一条件",
            ],
            statutes=[
                StatuteItem(
                    title="《中华人民共和国民法典》",
                    article="第一百七十二条",
                    content="行为人没有代理权、超越代理权或者代理权终止后，仍然实施代理行为，相对人有理由相信行为人有代理权的，代理行为有效。",
                )
            ],
            confusions=[
                ConfusionItem(
                    term="无权代理",
                    difference="无权代理原则上需本人追认才有效，表见代理即使没有追认，也可能直接对本人发生效力。",
                )
            ],
        )

    if "正当防卫" in normalized:
        return LearningResultResponse(
            question=normalized,
            concept="正当防卫是指为了使国家、公共利益、本人或者他人的人身、财产和其他权利免受正在进行的不法侵害，而对侵害人采取的制止行为。",
            elements=[
                "存在现实的不法侵害",
                "不法侵害正在进行",
                "防卫针对侵害人本人实施",
                "防卫没有明显超过必要限度",
            ],
            example="例如乙正在持刀攻击甲，甲为制止攻击将乙推倒并夺刀，该行为通常属于正当防卫。",
            mistakes=[
                "把事后报复误认为正当防卫",
                "忽视防卫必须针对正在进行的不法侵害",
            ],
            statutes=[
                StatuteItem(
                    title="《中华人民共和国刑法》",
                    article="第二十条",
                    content="为了使国家、公共利益、本人或者他人的人身、财产和其他权利免受正在进行的不法侵害，而采取的制止不法侵害的行为，对不法侵害人造成损害的，属于正当防卫，不负刑事责任。",
                )
            ],
            confusions=[
                ConfusionItem(
                    term="防卫过当",
                    difference="正当防卫没有明显超过必要限度，防卫过当则是在防卫中明显超过必要限度并造成重大损害。",
                )
            ],
        )

    result = DEFAULT_RESULT.model_copy(deep=True)
    result.question = normalized
    return result


def _build_retrieved_context_block(retrieved_chunks: list[str]) -> str:
    cleaned_chunks = [chunk.strip() for chunk in retrieved_chunks if chunk.strip()]
    if not cleaned_chunks:
        return ""

    lines = ["检索到的相关法律材料："]
    lines.extend(f"材料{index}：{chunk}" for index, chunk in enumerate(cleaned_chunks, start=1))
    lines.append("请优先参考以上材料；如果材料不足，可以结合通用法律知识补充，但不要编造法条。")
    return "\n".join(lines)


def _build_user_prompt(
    question: str,
    history: list[AskHistoryItem],
    retrieved_chunks: list[str] | None = None,
) -> str:
    context_block = _build_retrieved_context_block(retrieved_chunks or [])

    if not history:
        if context_block:
            return f"{context_block}\n新问题：{question}\n请解释这个法律问题，并返回严格 JSON。"
        return f"请解释这个法律问题，并返回严格 JSON：{question}"

    history_lines: list[str] = []
    for index, item in enumerate(history, start=1):
        statutes = "；".join(
            " ".join(part for part in [statute.title, statute.article, statute.content] if part).strip()
            for statute in item.answer.statutes
        )
        history_lines.extend(
            [
                f"第{index}轮问题：{item.question}",
                f"第{index}轮概念：{item.answer.concept}",
                f"第{index}轮要件：{'；'.join(item.answer.elements)}",
                f"第{index}轮案例：{item.answer.example}",
                f"第{index}轮误区：{'；'.join(item.answer.mistakes)}",
                f"第{index}轮法条：{statutes}",
            ]
        )

    history_block = "\n".join(history_lines)
    prompt = (
        "下面是之前的学习上下文，请在保持上下文连续性的前提下回答新问题，并返回严格 JSON。\n"
        f"{history_block}\n"
    )
    if context_block:
        prompt = f"{prompt}{context_block}\n"
    return f"{prompt}新问题：{question}"


def _validate_llm_config() -> None:
    missing_fields = []

    if not LLM_BASE_URL:
        missing_fields.append("LLM_BASE_URL")
    if not LLM_API_KEY:
        missing_fields.append("LLM_API_KEY")
    if not LLM_MODEL:
        missing_fields.append("LLM_MODEL")

    if missing_fields:
        joined = ", ".join(missing_fields)
        raise LLMServiceError(f"Missing LLM config: {joined}")


def _call_llm(
    question: str,
    history: list[AskHistoryItem],
    retrieved_chunks: list[str] | None = None,
) -> dict:
    _validate_llm_config()

    payload = {
        "model": LLM_MODEL,
        "temperature": LLM_TEMPERATURE,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": _build_user_prompt(question, history, retrieved_chunks),
            },
        ],
        "response_format": {"type": "json_object"},
    }

    try:
        with httpx.Client(timeout=LLM_TIMEOUT_SECONDS) as client:
            response = client.post(
                f"{LLM_BASE_URL.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": f"Bearer {LLM_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
    except httpx.HTTPError as exc:
        raise LLMServiceError(f"LLM service unavailable: {exc}") from exc

    if response.status_code >= 400:
        body_preview = response.text.strip()
        if len(body_preview) > 500:
            body_preview = f"{body_preview[:500]}..."
        raise LLMServiceError(
            f"LLM upstream error {response.status_code}: {body_preview}"
        )

    try:
        data = response.json()
    except ValueError as exc:
        raise LLMServiceError("LLM upstream returned non-JSON response") from exc

    try:
        content = data["choices"][0]["message"]["content"]
        return json.loads(content)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise LLMParseError("Failed to parse structured learning result") from exc


def _to_response(question: str, raw: dict) -> LearningResultResponse:
    if not isinstance(raw, dict):
        raise LLMParseError("Failed to parse structured learning result")

    confusions: list[ConfusionItem] = []
    for item in raw.get("confusions", []):
        if not isinstance(item, dict):
            continue
        term = str(item.get("term", "")).strip()
        difference = str(item.get("difference", "")).strip()
        if not term or not difference:
            continue
        confusions.append(ConfusionItem(term=term, difference=difference))

    statutes: list[StatuteItem] = []
    for item in raw.get("statutes", []):
        if isinstance(item, str):
            value = item.strip()
            if value:
                statutes.append(StatuteItem(title=value, article="", content=""))
            continue

        if not isinstance(item, dict):
            continue

        title = str(item.get("title", "")).strip()
        article = str(item.get("article", "")).strip()
        content = str(item.get("content", "")).strip()

        if not title and not article and not content:
            continue

        statutes.append(StatuteItem(title=title, article=article, content=content))

    response = LearningResultResponse(
        question=str(raw.get("question") or question).strip(),
        concept=str(raw.get("concept", "")).strip(),
        elements=[str(x).strip() for x in raw.get("elements", []) if str(x).strip()],
        example=str(raw.get("example", "")).strip(),
        mistakes=[str(x).strip() for x in raw.get("mistakes", []) if str(x).strip()],
        statutes=statutes,
        confusions=confusions,
    )

    if (
        not response.concept
        or not response.elements
        or not response.example
        or not response.mistakes
        or not response.statutes
    ):
        raise LLMParseError("Failed to parse structured learning result")

    return response


def generate_learning_result(
    question: str,
    history: list[AskHistoryItem] | None = None,
) -> LearningResultResponse:
    normalized = question.strip()
    normalized_history = history or []

    if not LLM_ENABLED:
        return _mock_result(normalized)

    retrieved_chunks: list[str] = []
    try:
        retrieved_chunks = retrieve_relevant_chunks(normalized)
    except Exception:
        retrieved_chunks = []

    raw = _call_llm(normalized, normalized_history, retrieved_chunks)
    return _to_response(normalized, raw)
