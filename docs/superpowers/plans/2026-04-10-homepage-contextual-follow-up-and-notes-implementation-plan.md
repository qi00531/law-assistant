# Homepage Contextual Follow-up And Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the homepage hero/header area, make follow-up asks carry structured history, show statute bodies, add per-result "already understood" saving, and switch the notes page to real backend data.

**Architecture:** Extend the FastAPI ask contract to accept structured history and return richer statute objects, then update the Vue homepage to operate as a minimal fixed-composer plus stacked results shell. Each result item owns its own save state so "已经理解" can persist one card at a time without blocking continued Q&A. The notes page becomes a thin real-data client over `/api/notes` rather than a mock-only view.

**Tech Stack:** FastAPI, Pydantic, httpx, Vue 3 `<script setup>`, TypeScript, Tailwind CSS, Vite, native `fetch`.

---

## File Map

- Modify: `backend/app/schemas/ask.py`
  Purpose: add ask history request types and richer statute response typing.
- Modify: `backend/app/api/ask.py`
  Purpose: pass structured history into the LLM service.
- Modify: `backend/app/services/llm_service.py`
  Purpose: build context-aware prompts, parse statute objects, and preserve mock behavior compatibility.
- Modify: `frontend/src/types/ask.ts`
  Purpose: mirror the new ask request/response shapes.
- Modify: `frontend/src/lib/api.ts`
  Purpose: send ask history, fetch notes list/detail, and keep note creation centralized.
- Modify: `frontend/src/types/homeTimeline.ts`
  Purpose: add per-item save state metadata.
- Modify: `frontend/src/utils/mapLearningResult.ts`
  Purpose: render statute bodies cleanly inside result modules.
- Modify: `frontend/src/utils/buildNotePayload.ts`
  Purpose: create single-result save payloads from richer statute objects.
- Modify: `frontend/src/pages/HomePage.vue`
  Purpose: remove the boxed header/guide area, accumulate results, send history, and drive per-item saves.
- Modify: `frontend/src/components/home/QuestionInput.vue`
  Purpose: reduce the composer to just the text box and send button.
- Modify: `frontend/src/components/home/LearningTimelineItem.vue`
  Purpose: add the "已经理解" button and card-level save feedback.
- Modify: `frontend/src/components/Sidebar.vue`
  Purpose: move the live theme toggle into the left nav footer.
- Modify: `frontend/src/pages/NotesPage.vue`
  Purpose: replace mock data source with live note list/detail fetching.
- Modify: `frontend/src/components/notes/NotesList.vue`
  Purpose: support backend-driven note identifiers and loading/empty states.
- Modify: `frontend/src/components/notes/NoteCard.vue`
  Purpose: render backend-backed note summaries without mock-only assumptions.
- Modify: `frontend/src/components/notes/NoteDetail.vue`
  Purpose: render backend-backed note details and basic local editing affordances safely.
- Create: `backend/tests/test_ask_api.py`
  Purpose: cover ask request history and statute parsing through the API layer.
- Create: `frontend/src/utils/homepageHistory.ts`
  Purpose: convert timeline items into ask history payloads in one place.

## Task 1: Add backend ask history and statute detail support

**Files:**
- Modify: `backend/app/schemas/ask.py`
- Modify: `backend/app/api/ask.py`
- Modify: `backend/app/services/llm_service.py`
- Test: `backend/tests/test_ask_api.py`

- [ ] **Step 1: Write the failing backend tests**

Create `backend/tests/test_ask_api.py` with tests for:

```python
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_ask_accepts_history_and_returns_statute_objects(monkeypatch):
    def fake_generate(question, history):
        assert question == "继续解释撤销权和解除权的区别"
        assert history[0].question == "什么是撤销权？"
        return {
            "question": question,
            "concept": "mock",
            "elements": ["a"],
            "example": "b",
            "mistakes": ["c"],
            "statutes": [
                {
                    "title": "《中华人民共和国民法典》",
                    "article": "第五百六十三条",
                    "content": "有下列情形之一的，当事人可以解除合同。",
                }
            ],
            "confusions": [],
        }

    monkeypatch.setattr("app.api.ask.generate_learning_result", fake_generate)

    response = client.post(
        "/api/ask",
        json={
            "question": "继续解释撤销权和解除权的区别",
            "history": [
                {
                    "question": "什么是撤销权？",
                    "answer": {
                        "question": "什么是撤销权？",
                        "concept": "mock",
                        "elements": ["a"],
                        "example": "b",
                        "mistakes": ["c"],
                        "statutes": [
                            {
                                "title": "《中华人民共和国民法典》",
                                "article": "第一百四十七条",
                                "content": "基于重大误解实施的民事法律行为，行为人有权请求人民法院或者仲裁机构予以撤销。",
                            }
                        ],
                        "confusions": [],
                    },
                }
            ],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["statutes"][0]["content"].startswith("有下列情形之一")
```

- [ ] **Step 2: Run the backend test to verify RED**

Run: `pytest backend/tests/test_ask_api.py -q`

Expected: FAIL because the current request schema rejects `history` and current response schema expects `statutes` strings.

- [ ] **Step 3: Implement minimal schema and service changes**

Add these types in `backend/app/schemas/ask.py`:

```python
class StatuteItem(BaseModel):
    title: str
    article: str
    content: str


class AskHistoryItem(BaseModel):
    question: str
    answer: "LearningResultResponse"


class AskRequest(BaseModel):
    question: Annotated[str, Field(min_length=1, max_length=500)]
    history: list[AskHistoryItem] = Field(default_factory=list)
```

Update `LearningResultResponse.statutes` to `list[StatuteItem]`, update `ask.py` to call:

```python
return generate_learning_result(payload.question, payload.history)
```

Update `llm_service.py` to:

```python
def generate_learning_result(question: str, history: list[AskHistoryItem] | None = None) -> LearningResultResponse:
    normalized = question.strip()
    normalized_history = history or []
    if not LLM_ENABLED:
        return _mock_result(normalized)
    raw = _call_llm(normalized, normalized_history)
    return _to_response(normalized, raw)
```

and parse statute objects defensively:

```python
for item in raw.get("statutes", []):
    if isinstance(item, str) and item.strip():
        statutes.append(StatuteItem(title=item.strip(), article="", content=""))
    elif isinstance(item, dict):
        title = str(item.get("title", "")).strip()
        article = str(item.get("article", "")).strip()
        content = str(item.get("content", "")).strip()
        if title or article or content:
            statutes.append(StatuteItem(title=title, article=article, content=content))
```

- [ ] **Step 4: Run the backend test to verify GREEN**

Run: `pytest backend/tests/test_ask_api.py -q`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/schemas/ask.py backend/app/api/ask.py backend/app/services/llm_service.py backend/tests/test_ask_api.py
git commit -m "feat: support contextual ask history and statute details"
```

## Task 2: Add frontend ask/history typing and single-card save helpers

**Files:**
- Modify: `frontend/src/types/ask.ts`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/types/homeTimeline.ts`
- Modify: `frontend/src/utils/buildNotePayload.ts`
- Modify: `frontend/src/utils/mapLearningResult.ts`
- Create: `frontend/src/utils/homepageHistory.ts`

- [ ] **Step 1: Write the failing frontend type/build expectation**

Run: `npm run build`

Expected: The current frontend build would fail after Task 1 because `statutes` is still typed as `string[]` and `askLegalQuestion` does not accept history.

- [ ] **Step 2: Implement the minimal frontend contracts**

In `frontend/src/types/ask.ts`:

```ts
export interface StatuteItem {
  title: string
  article: string
  content: string
}

export interface AskHistoryItem {
  question: string
  answer: LearningResultResponse
}
```

and change `LearningResultResponse.statutes` to `StatuteItem[]`.

In `frontend/src/lib/api.ts` change:

```ts
export const askLegalQuestion = async (
  question: string,
  history: AskHistoryItem[] = [],
): Promise<LearningResultResponse> => {
  ...
  body: JSON.stringify({ question, history })
}
```

Create `frontend/src/utils/homepageHistory.ts`:

```ts
import type { AskHistoryItem } from '../types/ask'
import type { LearningTimelineItem } from '../types/homeTimeline'

export const buildAskHistory = (items: LearningTimelineItem[]): AskHistoryItem[] =>
  items.map((item) => ({
    question: item.question,
    answer: item.result,
  }))
```

Update note payload and module mapping to read statute objects:

```ts
statutes: result.statutes.map((item) => [item.title, item.article, item.content].filter(Boolean).join(' '))
```

- [ ] **Step 3: Re-run the frontend build to verify GREEN**

Run: `npm run build`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/ask.ts frontend/src/lib/api.ts frontend/src/types/homeTimeline.ts frontend/src/utils/buildNotePayload.ts frontend/src/utils/mapLearningResult.ts frontend/src/utils/homepageHistory.ts
git commit -m "feat: add homepage ask history and statute typing"
```

## Task 3: Remove the homepage boxed header and add per-card save actions

**Files:**
- Modify: `frontend/src/pages/HomePage.vue`
- Modify: `frontend/src/components/home/QuestionInput.vue`
- Modify: `frontend/src/components/home/LearningTimelineItem.vue`
- Modify: `frontend/src/components/Sidebar.vue`

- [ ] **Step 1: Write the failing UI behavior check**

Run: `npm run build`

Expected: No build failure yet, but the current homepage still renders the boxed header, intro copy, helper text, and no per-card save button.

- [ ] **Step 2: Implement the minimal homepage state and layout changes**

Update `frontend/src/pages/HomePage.vue` so:

```ts
const submitQuestion = async (question: string, relation: 'root' | 'follow_up' = 'root') => {
  const trimmedQuestion = question.trim()
  if (!trimmedQuestion || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const result = await askLegalQuestion(trimmedQuestion, buildAskHistory(timelineItems.value))
    ...
    timelineItems.value = [...timelineItems.value, { ...nextItem, saveState: 'idle', saveFeedback: '' }]
  } finally {
    isSubmitting.value = false
  }
}
```

Delete the current top boxed header section and the initial intro block from the template. Keep only:

```vue
<div class="home-timeline-scroll space-y-6">
  <LearningTimeline ... @save-item="handleSaveItem" />
  <p v-if="submitError" class="...">{{ submitError }}</p>
</div>
```

Reduce `QuestionInput.vue` to only the textarea shell and send button. Add the save button to `LearningTimelineItem.vue`:

```vue
<div class="flex justify-end border-t border-slate-100 pt-4">
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
    :disabled="item.saveState === 'saving' || item.saveState === 'saved'"
    @click="emit('save-item', item.id)"
  >
    {{ item.saveState === 'saved' ? '已理解并保存' : item.saveState === 'saving' ? '保存中…' : '已经理解' }}
  </button>
</div>
```

Make the sidebar footer theme card a real button calling `toggleTheme`.

- [ ] **Step 3: Run the frontend build to verify GREEN**

Run: `npm run build`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/HomePage.vue frontend/src/components/home/QuestionInput.vue frontend/src/components/home/LearningTimelineItem.vue frontend/src/components/Sidebar.vue
git commit -m "feat: simplify homepage and add per-result save"
```

## Task 4: Switch the notes page to live backend data

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/pages/NotesPage.vue`
- Modify: `frontend/src/components/notes/NotesList.vue`
- Modify: `frontend/src/components/notes/NoteCard.vue`
- Modify: `frontend/src/components/notes/NoteDetail.vue`

- [ ] **Step 1: Write the failing runtime expectation**

Run: `npm run build`

Expected: The current notes page still depends entirely on `mockNotesData`, so newly saved cards never appear there.

- [ ] **Step 2: Implement minimal live note fetching**

Add to `frontend/src/lib/api.ts`:

```ts
export const fetchLearningNotes = async (): Promise<NoteResponse[]> => { ... }
export const fetchLearningNote = async (noteId: number): Promise<NoteResponse> => { ... }
```

Update `NotesPage.vue` to fetch list on mount, normalize backend responses into page view models, and fetch details for the selected note. Keep existing layout structure but remove the hard dependency on `mockNotesData`.

- [ ] **Step 3: Run the frontend build to verify GREEN**

Run: `npm run build`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/pages/NotesPage.vue frontend/src/components/notes/NotesList.vue frontend/src/components/notes/NoteCard.vue frontend/src/components/notes/NoteDetail.vue
git commit -m "feat: load notes page from backend data"
```

## Task 5: End-to-end verification

**Files:**
- Modify: none

- [ ] **Step 1: Run backend tests**

Run: `pytest backend/tests/test_ask_api.py -q`

Expected: PASS

- [ ] **Step 2: Run frontend production build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 3: Manual functional checklist**

Verify:

```text
1. /home no longer shows the boxed header/intro block from the screenshot.
2. The composer only shows the input area and send button.
3. Asking a second question keeps the first result on the page.
4. Each follow-up request sends prior results as history.
5. Result cards show statute text, not just article labels.
6. Clicking "已经理解" saves that card and changes button state.
7. /notes shows the newly saved card from the backend.
```

- [ ] **Step 4: Commit any last-mile fixes**

```bash
git add .
git commit -m "fix: polish contextual homepage notes flow"
```

## Self-Review

- Spec coverage: covered homepage hero removal, input simplification, contextual follow-up, statute body rendering, per-card save, real notes page data.
- Placeholder scan: removed generic “handle appropriately” wording from implementation steps and kept concrete file paths and commands.
- Type consistency: the plan uses `StatuteItem`, `AskHistoryItem`, `saveState`, and backend `history` consistently across tasks.
