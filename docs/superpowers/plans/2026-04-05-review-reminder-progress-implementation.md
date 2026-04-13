# Review Reminder, Study Logs, and Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-click review plans for notes, automatic study logs, lightweight review progress tracking, and due-review surfaces on the home page and notes page.

**Architecture:** Extend the existing in-memory note model in `backend/main.py` with review-plan metadata, study logs, and progress state, then update the current review flow so plan creation, reminder updates, and review completion all write to that state. On the frontend, keep the current single-file app structure in `frontend/src/App.vue`, but add due-review sections plus note-detail review plan controls so the new review lifecycle stays attached to notes instead of becoming a separate subsystem.

**Tech Stack:** FastAPI, Pydantic, in-memory Python state, Vue 3 with `<script setup lang="ts">`, Fetch API, existing app-local CSS in `frontend/src/style.css`

---

## File Structure

- Modify: `backend/main.py`
  Responsibility: extend note models with review plan metadata, study logs, and progress; add due-review and review-plan endpoints; update review evaluation side effects.
- Modify: `frontend/src/App.vue`
  Responsibility: add due-review state, note detail review-plan actions, shortcut reminder options, custom reminder form state, progress display, and study log rendering.
- Modify: `frontend/src/style.css`
  Responsibility: style due-review cards, review plan controls, progress summary blocks, and study log timelines.

No new files are required for the first version because review, notes, and history state all currently live inside the existing backend and single-file frontend.

### Task 1: Extend Backend Note Models With Review Plan State

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Add failing backend smoke tests for review plan metadata**

Create `tests/test_review_plan_backend.py` with:

```python
from fastapi.testclient import TestClient

from backend.main import app, history_store


client = TestClient(app)


def setup_function() -> None:
    history_store.clear()


def note_payload() -> dict:
    return {
        "question": "什么是表见代理？",
        "answer": {
            "definition": "表见代理是基于外观产生代理效力的制度。",
            "explanation": "围绕代理权外观展开。",
            "elements": ["无代理权", "相对人有理由相信有代理权"],
            "example": "离职销售经理继续持章签约。",
            "comparison": [],
            "law": ["《中华人民共和国民法典》第172条"],
            "exam_points": ["表见代理与无权代理辨析"],
            "context_summary": "首次解释",
            "history_count": 0,
            "next_actions": [],
        },
    }


def test_saved_note_has_review_plan_defaults() -> None:
    response = client.post("/history/save-note", json=note_payload())

    assert response.status_code == 200
    body = response.json()
    assert body["review_plan_enabled"] is False
    assert body["review_reminder_at"] is None
    assert body["review_progress"] == {
        "review_count": 0,
        "last_reviewed_at": None,
        "last_score": None,
        "last_level": None,
    }
    assert body["study_logs"] == []
```

- [ ] **Step 2: Run the smoke test and verify it fails**

Run: `pytest tests/test_review_plan_backend.py::test_saved_note_has_review_plan_defaults -q`

Expected: FAIL because notes do not yet include `review_plan_enabled`, `review_reminder_at`, `review_progress`, or `study_logs`.

- [ ] **Step 3: Add explicit review plan types to `backend/main.py`**

Insert the new models near the existing history and supplement models:

```python
class ReviewProgress(BaseModel):
    review_count: int = 0
    last_reviewed_at: str | None = None
    last_score: int | None = None
    last_level: str | None = None


class StudyLogEntry(BaseModel):
    id: str
    type: Literal[
        "plan_enabled",
        "reminder_updated",
        "review_started",
        "answer_submitted",
        "review_completed",
    ]
    message: str
    created_at: str


class HistorySummary(BaseModel):
    id: str
    title: str
    question: str
    created_at: str
    is_note: bool = False
    category: CategoryName | None = None
    category_source: Literal["auto", "manual"] | None = None
    review_plan_enabled: bool = False
    review_reminder_at: str | None = None


class HistoryDetail(HistorySummary):
    answer: ChatResponse
    supplements: list[SupplementRecord] = Field(default_factory=list)
    review_progress: ReviewProgress = Field(default_factory=ReviewProgress)
    study_logs: list[StudyLogEntry] = Field(default_factory=list)
```

- [ ] **Step 4: Initialize review defaults inside note creation**

Update `create_history_record(...)`:

```python
def create_history_record(
    question: str,
    answer: ChatResponse,
    title: str,
    is_note: bool = False,
) -> HistoryDetail:
    category = classify_note(question, answer) if is_note else None
    return HistoryDetail(
        id=str(uuid4()),
        title=title,
        question=question,
        created_at=datetime.now().isoformat(timespec="seconds"),
        is_note=is_note,
        category=category,
        category_source="auto" if is_note else None,
        answer=answer.model_copy(deep=True),
        supplements=[],
        review_plan_enabled=False,
        review_reminder_at=None,
        review_progress=ReviewProgress(),
        study_logs=[],
    )
```

- [ ] **Step 5: Ensure existing history endpoints return the new summary fields**

Update the `/history`, `/history/match`, and any helper-generated `HistorySummary(...)` responses:

```python
HistorySummary(
    id=item.id,
    title=item.title,
    question=item.question,
    created_at=item.created_at,
    is_note=item.is_note,
    category=item.category,
    category_source=item.category_source,
    review_plan_enabled=item.review_plan_enabled,
    review_reminder_at=item.review_reminder_at,
)
```

- [ ] **Step 6: Re-run the smoke test**

Run: `pytest tests/test_review_plan_backend.py::test_saved_note_has_review_plan_defaults -q`

Expected: PASS with a saved note exposing review plan defaults.

- [ ] **Step 7: Commit**

```bash
git add backend/main.py tests/test_review_plan_backend.py
git commit -m "feat: add review plan metadata to notes"
```

### Task 2: Add Review Plan and Due-Review Backend APIs

**Files:**
- Modify: `backend/main.py`
- Test: `tests/test_review_plan_backend.py`

- [ ] **Step 1: Add failing backend smoke tests for enabling plans, updating reminders, and listing due reviews**

Append these tests:

```python
def test_enable_review_plan_sets_reminder_and_logs() -> None:
    saved = client.post("/history/save-note", json=note_payload()).json()

    response = client.post(
        f"/history/{saved['id']}/review-plan",
        json={"preset": "3d"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["review_plan_enabled"] is True
    assert body["review_reminder_at"] is not None
    assert body["study_logs"][0]["type"] == "plan_enabled"


def test_update_review_plan_changes_reminder_and_logs() -> None:
    saved = client.post("/history/save-note", json=note_payload()).json()
    client.post(f"/history/{saved['id']}/review-plan", json={"preset": "1d"})

    response = client.patch(
        f"/history/{saved['id']}/review-plan",
        json={"preset": "7d"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["review_reminder_at"] is not None
    assert body["study_logs"][0]["type"] == "reminder_updated"


def test_due_reviews_returns_only_enabled_notes() -> None:
    first = client.post("/history/save-note", json=note_payload()).json()
    second = client.post("/history/save-note", json=note_payload()).json()
    client.post(f"/history/{first['id']}/review-plan", json={"preset": "1d"})

    response = client.get("/reviews/due")

    assert response.status_code == 200
    body = response.json()
    assert [item["id"] for item in body] == [first["id"]]
```

- [ ] **Step 2: Run the smoke tests and verify they fail**

Run: `pytest tests/test_review_plan_backend.py -q`

Expected: FAIL because `/history/{id}/review-plan` and `/reviews/due` do not exist yet.

- [ ] **Step 3: Add request models and reminder helper functions**

Add these models and helpers:

```python
class ReviewPlanRequest(BaseModel):
    preset: Literal["1d", "3d", "7d", "custom"] | None = None
    reminder_at: str | None = None


def iso_now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def resolve_reminder_time(payload: ReviewPlanRequest) -> str:
    now = datetime.now()
    if payload.preset == "1d":
        return (now + timedelta(days=1)).isoformat(timespec="seconds")
    if payload.preset == "3d":
        return (now + timedelta(days=3)).isoformat(timespec="seconds")
    if payload.preset == "7d":
        return (now + timedelta(days=7)).isoformat(timespec="seconds")
    if payload.preset == "custom" and payload.reminder_at:
        return datetime.fromisoformat(payload.reminder_at).isoformat(timespec="seconds")
    raise HTTPException(status_code=400, detail="请选择提醒时间")


def append_study_log(record: HistoryDetail, log_type: StudyLogEntry["type"], message: str) -> None:
    record.study_logs.insert(
        0,
        StudyLogEntry(
            id=str(uuid4()),
            type=log_type,
            message=message,
            created_at=iso_now(),
        ),
    )
```

- [ ] **Step 4: Implement review plan enable/update endpoints**

Add these endpoints:

```python
@app.post("/history/{record_id}/review-plan", response_model=HistoryDetail)
def enable_review_plan(record_id: str, payload: ReviewPlanRequest) -> HistoryDetail:
    record = get_history_detail(record_id)
    if not record.is_note:
        raise HTTPException(status_code=400, detail="只有笔记支持开启复习计划")
    record.review_plan_enabled = True
    record.review_reminder_at = resolve_reminder_time(payload)
    append_study_log(record, "plan_enabled", f"已开启复习计划，下次提醒时间：{record.review_reminder_at}")
    return record


@app.patch("/history/{record_id}/review-plan", response_model=HistoryDetail)
def update_review_plan(record_id: str, payload: ReviewPlanRequest) -> HistoryDetail:
    record = get_history_detail(record_id)
    if not record.is_note:
        raise HTTPException(status_code=400, detail="只有笔记支持调整复习计划")
    if not record.review_plan_enabled:
        raise HTTPException(status_code=400, detail="请先开启复习计划")
    record.review_reminder_at = resolve_reminder_time(payload)
    append_study_log(record, "reminder_updated", f"已调整提醒时间：{record.review_reminder_at}")
    return record
```

- [ ] **Step 5: Implement due-review listing**

```python
@app.get("/reviews/due", response_model=list[HistorySummary])
def get_due_reviews() -> list[HistorySummary]:
    active_notes = [
        item for item in history_store
        if item.is_note and item.review_plan_enabled and item.review_reminder_at
    ]
    active_notes.sort(key=lambda item: item.review_reminder_at or "")
    return [
        HistorySummary(
            id=item.id,
            title=item.title,
            question=item.question,
            created_at=item.created_at,
            is_note=item.is_note,
            category=item.category,
            category_source=item.category_source,
            review_plan_enabled=item.review_plan_enabled,
            review_reminder_at=item.review_reminder_at,
        )
        for item in active_notes
    ]
```

- [ ] **Step 6: Run the backend smoke tests**

Run: `pytest tests/test_review_plan_backend.py -q`

Expected: PASS with review plans, reminder updates, and due-review listing all working.

- [ ] **Step 7: Commit**

```bash
git add backend/main.py tests/test_review_plan_backend.py
git commit -m "feat: add review plan and due review endpoints"
```

### Task 3: Update Review Evaluation to Write Study Logs and Progress

**Files:**
- Modify: `backend/main.py`
- Test: `tests/test_review_plan_backend.py`

- [ ] **Step 1: Add failing smoke tests for review completion side effects**

Append these tests:

```python
def test_review_evaluate_updates_progress_and_logs() -> None:
    saved = client.post("/history/save-note", json=note_payload()).json()
    client.post(f"/history/{saved['id']}/review-plan", json={"preset": "1d"})

    response = client.post(
        "/review/evaluate",
        json={
            "record_id": saved["id"],
            "question": saved["question"],
            "user_answer": "表见代理是让外观代理对本人发生效力。",
            "standard_answer": saved["answer"],
        },
    )

    assert response.status_code == 200

    detail = client.get(f"/history/{saved['id']}").json()
    assert detail["review_progress"]["review_count"] == 1
    assert detail["review_progress"]["last_reviewed_at"] is not None
    assert detail["review_progress"]["last_score"] is not None
    assert detail["study_logs"][0]["type"] == "review_completed"
```

- [ ] **Step 2: Run the smoke test and verify it fails**

Run: `pytest tests/test_review_plan_backend.py::test_review_evaluate_updates_progress_and_logs -q`

Expected: FAIL because `/review/evaluate` does not yet update note progress or study logs.

- [ ] **Step 3: Add record-aware review evaluation request support**

Extend the existing review evaluation request model:

```python
class ReviewEvaluateRequest(BaseModel):
    record_id: str | None = None
    question: str
    user_answer: str
    standard_answer: ChatResponse
```

- [ ] **Step 4: Update `/review/evaluate` to write progress and logs**

Inside the existing review evaluation endpoint, after producing the evaluation payload:

```python
if payload.record_id:
    record = get_history_detail(payload.record_id)
    if record.is_note:
        append_study_log(record, "answer_submitted", f"已提交“{record.question}”的复习作答")
        record.review_progress.review_count += 1
        record.review_progress.last_reviewed_at = iso_now()
        record.review_progress.last_score = evaluation.score
        record.review_progress.last_level = evaluation.level
        append_study_log(
            record,
            "review_completed",
            f"完成一次复习，得分 {evaluation.score} 分，结果为 {evaluation.level}",
        )
```

- [ ] **Step 5: Run the focused smoke test**

Run: `pytest tests/test_review_plan_backend.py::test_review_evaluate_updates_progress_and_logs -q`

Expected: PASS with review completion updating both progress and logs.

- [ ] **Step 6: Commit**

```bash
git add backend/main.py tests/test_review_plan_backend.py
git commit -m "feat: persist review progress updates"
```

### Task 4: Add Frontend Due-Review Sections on Home and Notes Pages

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`

- [ ] **Step 1: Add failing UI acceptance checklist**

```text
1. 首页没有待复习提醒区块。
2. 笔记页顶部没有待复习提醒入口。
3. 开启了复习计划的笔记不会出现在任何全局入口中。
```

- [ ] **Step 2: Add review-plan state and due-review loaders**

Add these frontend types and state:

```ts
type ReviewProgress = {
  review_count: number
  last_reviewed_at: string | null
  last_score: number | null
  last_level: string | null
}

type StudyLogEntry = {
  id: string
  type: 'plan_enabled' | 'reminder_updated' | 'review_started' | 'answer_submitted' | 'review_completed'
  message: string
  created_at: string
}

type HistorySummary = {
  id: string
  title: string
  question: string
  created_at: string
  is_note: boolean
  category?: string | null
  category_source?: 'auto' | 'manual' | null
  review_plan_enabled?: boolean
  review_reminder_at?: string | null
}

type HistoryDetail = HistorySummary & {
  answer: ChatResponse
  supplements?: SupplementRecord[]
  review_progress?: ReviewProgress
  study_logs?: StudyLogEntry[]
}

const dueReviewRecords = ref<HistorySummary[]>([])

async function loadDueReviews() {
  try {
    const response = await fetch('http://127.0.0.1:8000/reviews/due')
    if (!response.ok) {
      dueReviewRecords.value = []
      return
    }
    dueReviewRecords.value = (await response.json()) as HistorySummary[]
  } catch {
    dueReviewRecords.value = []
  }
}
```

- [ ] **Step 3: Load due-review data alongside existing history data**

Update lifecycle hooks and refresh points:

```ts
onMounted(() => {
  void loadInputConfig()
  void loadSavedHistory()
  void loadDueReviews()
  syncIntroOverlay()
  window.addEventListener('hashchange', handleHashChange)
})
```

After enabling/updating review plans and after review evaluation completes, also call `await loadDueReviews()`.

- [ ] **Step 4: Render due-review cards on the home page and notes page**

Add a reusable section in `App.vue`:

```vue
<section v-if="dueReviewRecords.length" class="due-review-card">
  <div class="history-header compact-header">
    <div>
      <p class="result-label">待复习提醒</p>
      <h2 class="result-title">这些知识点该回看了</h2>
    </div>
  </div>
  <div class="due-review-list">
    <article v-for="item in dueReviewRecords.slice(0, 4)" :key="item.id" class="due-review-item">
      <div>
        <strong>{{ item.title }}</strong>
        <p>{{ item.category || '其他' }} · {{ item.question }}</p>
        <span>下次提醒：{{ formatDate(item.review_reminder_at || item.created_at) }}</span>
      </div>
      <div class="history-item-actions">
        <button class="mini-button" @click="startReview(item.id)">去复习</button>
        <button class="mini-button" @click="openHistoryDetail(item.id)">查看详情</button>
      </div>
    </article>
  </div>
</section>
```

Render it once on the home page above the main content and once at the top of the notes page.

- [ ] **Step 5: Style the due-review section**

```css
.due-review-card {
  display: grid;
  gap: 16px;
  padding: 20px 22px;
  border-radius: 28px;
  background: rgba(255, 252, 246, 0.92);
  border: 1px solid rgba(188, 168, 122, 0.18);
  box-shadow: 0 18px 40px rgba(103, 86, 55, 0.08);
}

.due-review-list {
  display: grid;
  gap: 12px;
}

.due-review-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
}
```

- [ ] **Step 6: Run the frontend build**

Run: `npm run build`

Expected: PASS and both home and notes pages now show due-review reminders when data exists.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.vue frontend/src/style.css
git commit -m "feat: surface due reviews on home and notes"
```

### Task 5: Add Note Detail Review Plan Controls, Progress, and Study Logs

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`

- [ ] **Step 1: Add failing UI acceptance checklist**

```text
1. 笔记详情页没有“开启复习计划”入口。
2. 用户无法选择明天、3天后、7天后或自定义时间。
3. 笔记详情页无法看到复习进度和学习记录。
```

- [ ] **Step 2: Add note detail review-plan state and actions**

Add this state:

```ts
const reviewPlanPreset = ref<'1d' | '3d' | '7d' | 'custom'>('1d')
const reviewPlanCustomTime = ref('')

const canSubmitReviewPlan = computed(() => {
  if (!selectedNoteDetail.value) return false
  if (reviewPlanPreset.value === 'custom') {
    return !!reviewPlanCustomTime.value
  }
  return true
})

async function submitReviewPlan() {
  if (!selectedNoteDetail.value || !canSubmitReviewPlan.value) {
    return
  }
  const method = selectedNoteDetail.value.review_plan_enabled ? 'PATCH' : 'POST'
  const response = await fetch(`http://127.0.0.1:8000/history/${selectedNoteDetail.value.id}/review-plan`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preset: reviewPlanPreset.value,
      reminder_at: reviewPlanPreset.value === 'custom' ? reviewPlanCustomTime.value : null,
    }),
  })
  const data = await response.json()
  if (!response.ok) {
    errorMessage.value = data.detail || '网络异常，请重试'
    return
  }
  selectedNoteDetail.value = data as HistoryDetail
  await loadSavedHistory()
  await loadDueReviews()
}
```

- [ ] **Step 3: Add the review-plan UI block to note detail**

Render this inside the note detail area:

```vue
<section class="review-plan-card">
  <div class="history-header compact-header">
    <div>
      <p class="result-label">复习计划</p>
      <h3>{{ selectedNoteDetail?.review_plan_enabled ? '调整复习计划' : '开启复习计划' }}</h3>
    </div>
  </div>

  <div class="review-plan-options">
    <button
      v-for="preset in [
        { key: '1d', label: '明天' },
        { key: '3d', label: '3天后' },
        { key: '7d', label: '7天后' },
        { key: 'custom', label: '自定义时间' },
      ]"
      :key="preset.key"
      :class="['mini-button', { active: reviewPlanPreset === preset.key }]"
      @click="reviewPlanPreset = preset.key as '1d' | '3d' | '7d' | 'custom'"
    >
      {{ preset.label }}
    </button>
  </div>

  <input
    v-if="reviewPlanPreset === 'custom'"
    v-model="reviewPlanCustomTime"
    class="question-input"
    type="datetime-local"
  />

  <div class="composer-actions">
    <span v-if="selectedNoteDetail?.review_reminder_at">当前提醒：{{ formatDate(selectedNoteDetail.review_reminder_at) }}</span>
    <button class="submit-button" :disabled="!canSubmitReviewPlan" @click="submitReviewPlan">
      {{ selectedNoteDetail?.review_plan_enabled ? '更新提醒时间' : '开启复习计划' }}
    </button>
  </div>
</section>
```

- [ ] **Step 4: Add review progress and study log rendering**

Append these sections below the review-plan card:

```vue
<section class="review-progress-card">
  <div class="history-header compact-header">
    <div>
      <p class="result-label">复习进度</p>
      <h3>当前追踪情况</h3>
    </div>
  </div>
  <div class="review-progress-grid">
    <article class="result-card"><h4>已复习次数</h4><p>{{ selectedNoteDetail?.review_progress?.review_count || 0 }}</p></article>
    <article class="result-card"><h4>最近复习</h4><p>{{ selectedNoteDetail?.review_progress?.last_reviewed_at ? formatDate(selectedNoteDetail.review_progress.last_reviewed_at) : '暂未复习' }}</p></article>
    <article class="result-card"><h4>最近得分</h4><p>{{ selectedNoteDetail?.review_progress?.last_score ?? '暂无' }}</p></article>
    <article class="result-card"><h4>掌握状态</h4><p>{{ selectedNoteDetail?.review_progress?.last_level ?? '暂无' }}</p></article>
  </div>
</section>

<section class="study-log-card">
  <div class="history-header compact-header">
    <div>
      <p class="result-label">学习记录</p>
      <h3>自动生成的复习轨迹</h3>
    </div>
  </div>
  <div v-if="selectedNoteDetail?.study_logs?.length" class="study-log-list">
    <article v-for="item in selectedNoteDetail.study_logs" :key="item.id" class="study-log-item">
      <strong>{{ item.message }}</strong>
      <span>{{ formatDate(item.created_at) }}</span>
    </article>
  </div>
  <p v-else class="empty-history">还没有学习记录，开启复习计划或完成一次复习后会自动生成。</p>
</section>
```

- [ ] **Step 5: Style review plan, progress, and study logs**

```css
.review-plan-card,
.review-progress-card,
.study-log-card {
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 252, 246, 0.92);
  border: 1px solid rgba(188, 168, 122, 0.18);
}

.review-plan-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.review-progress-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.study-log-list {
  display: grid;
  gap: 12px;
}
```

- [ ] **Step 6: Run the frontend build**

Run: `npm run build`

Expected: PASS and note detail now supports enabling/updating review plans, plus showing progress and study logs.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.vue frontend/src/style.css
git commit -m "feat: add review plan controls to note detail"
```

### Task 6: Wire Review Actions to Logs and Run Final Verification

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `backend/main.py`
- Test: `tests/test_review_plan_backend.py`

- [ ] **Step 1: Add failing acceptance checklist**

```text
1. 开启复习计划后，从首页点“去复习”不会带来后续进度更新。
2. 完成一次复习评估后，首页待复习入口和笔记详情状态没有刷新。
3. 学习记录中缺少开始复习或完成复习记录。
```

- [ ] **Step 2: Make review entry and completion refresh the new state**

Update `startReview` and `submitReviewAnswer`:

```ts
async function startReview(id: string, fromConversation = false) {
  // existing fetch/detail logic...
  reviewRecord.value = detail
  if (selectedNoteDetail.value?.id === detail.id) {
    selectedNoteDetail.value = detail
  }
}

async function submitReviewAnswer() {
  if (!reviewRecord.value || !reviewDraft.value.trim()) {
    return
  }
  const response = await fetch('http://127.0.0.1:8000/review/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      record_id: reviewRecord.value.id,
      question: reviewRecord.value.question,
      user_answer: reviewDraft.value.trim(),
      standard_answer: reviewRecord.value.answer,
    }),
  })
  // existing evaluation handling...
  await loadSavedHistory()
  await loadDueReviews()
  if (selectedNoteDetail.value?.id === reviewRecord.value.id) {
    await openHistoryDetail(reviewRecord.value.id)
  }
}
```

- [ ] **Step 3: Add backend review-start study log support**

Inside the review-start path, use the existing detail fetch plus a lightweight backend endpoint:

```python
@app.post("/history/{record_id}/review-start", response_model=HistoryDetail)
def log_review_start(record_id: str) -> HistoryDetail:
    record = get_history_detail(record_id)
    if not record.is_note:
        raise HTTPException(status_code=400, detail="只有笔记支持复习记录")
    append_study_log(record, "review_started", f"开始复习“{record.question}”")
    return record
```

Call it from `startReview` after loading the detail when the record is a note.

- [ ] **Step 4: Expand smoke coverage for review-start logging**

Append this test:

```python
def test_review_start_writes_study_log() -> None:
    saved = client.post("/history/save-note", json=note_payload()).json()

    response = client.post(f"/history/{saved['id']}/review-start")

    assert response.status_code == 200
    body = response.json()
    assert body["study_logs"][0]["type"] == "review_started"
```

- [ ] **Step 5: Run final verification**

Run:

```bash
python3 -m py_compile backend/main.py
pytest tests/test_review_plan_backend.py -q
npm run build
```

Expected:
- `python3 -m py_compile backend/main.py` exits successfully
- `pytest tests/test_review_plan_backend.py -q` passes
- `npm run build` passes

- [ ] **Step 6: Commit**

```bash
git add backend/main.py frontend/src/App.vue frontend/src/style.css tests/test_review_plan_backend.py
git commit -m "feat: connect review reminders progress and logs"
```
