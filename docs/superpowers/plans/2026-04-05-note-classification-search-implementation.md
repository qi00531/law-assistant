# Note Classification, Search, and Detail View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add fixed-domain auto classification, note search, a dedicated note detail view, and note-focused follow-up questions that append supplements instead of overwriting the original note.

**Architecture:** Extend the existing in-memory FastAPI note store with explicit note metadata (`category`, `category_source`, `supplements`) and add focused note endpoints for category updates, search, and supplement generation. On the frontend, keep the current single-file page shell in `App.vue`, but introduce note-specific view state and grouped rendering so users can search notes, open a dedicated detail view, edit metadata, and continue asking around one saved note.

**Tech Stack:** FastAPI, Pydantic, in-memory Python state, Vue 3 with `<script setup lang="ts">`, Fetch API, existing app-local CSS in `frontend/src/style.css`

---

## File Structure

- Modify: `backend/main.py`
  Responsibility: extend note/history models, implement classification helpers, note search, category update, supplement append flow, and any note-related response shaping.
- Modify: `frontend/src/App.vue`
  Responsibility: add note category-aware types and state, grouped note search list, note detail view, category editing, and note supplement composer flow.
- Modify: `frontend/src/style.css`
  Responsibility: style the new note search bar, grouped category sections, note detail header/actions, supplement timeline, and note follow-up composer.

No new files are required for the first version because the current codebase already concentrates backend logic in `backend/main.py` and UI logic in `frontend/src/App.vue`.

### Task 1: Extend Backend Note Models and Auto Classification

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Add failing backend tests as executable smoke snippets**

Use a temporary test file pattern locally before implementation:

```python
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_save_note_returns_auto_category():
    payload = {
        "question": "什么是表见代理？",
        "answer": {
            "definition": "表见代理是...",
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
    response = client.post("/history/save-note", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["is_note"] is True
    assert body["category"] == "民法"
    assert body["category_source"] == "auto"
    assert body["supplements"] == []
```

- [ ] **Step 2: Run the smoke test and verify it fails**

Run: `pytest tests/test_note_classification_smoke.py -q`

Expected: FAIL because `HistoryDetail` does not yet expose `category`, `category_source`, or `supplements`, and `/history/save-note` does not populate them.

- [ ] **Step 3: Add note category and supplement models to `backend/main.py`**

Implement explicit types near the existing `HistorySummary`/`HistoryDetail` definitions:

```python
NOTE_CATEGORIES = [
    "民法",
    "刑法",
    "行政法",
    "诉讼法",
    "商法/经济法",
    "宪法/法理",
    "其他",
]

CategoryName = Literal[
    "民法",
    "刑法",
    "行政法",
    "诉讼法",
    "商法/经济法",
    "宪法/法理",
    "其他",
]


class SupplementRecord(BaseModel):
    id: str
    question: str
    answer: ChatResponse
    created_at: str


class HistorySummary(BaseModel):
    id: str
    title: str
    question: str
    created_at: str
    is_note: bool = False
    category: CategoryName | None = None
    category_source: Literal["auto", "manual"] | None = None


class HistoryDetail(HistorySummary):
    answer: ChatResponse
    supplements: list[SupplementRecord] = []
```

- [ ] **Step 4: Add classification helpers and wire them into note creation**

Implement keyword-driven classification and default supplement initialization:

```python
CATEGORY_KEYWORDS: dict[CategoryName, tuple[str, ...]] = {
    "民法": ("合同", "侵权", "物权", "表见代理", "善意取得", "代理"),
    "刑法": ("犯罪", "刑罚", "故意", "过失", "正当防卫", "共同犯罪"),
    "行政法": ("行政行为", "行政处罚", "行政许可", "行政强制"),
    "诉讼法": ("起诉", "上诉", "管辖", "举证", "程序", "诉讼"),
    "商法/经济法": ("公司", "票据", "证券", "破产", "竞争法", "消费者"),
    "宪法/法理": ("宪法", "法理", "法律原则", "法的价值"),
}


def extract_note_search_text(question: str, answer: ChatResponse) -> str:
    parts = [
        question,
        answer.definition,
        answer.explanation,
        answer.example,
        *answer.elements,
        *answer.law,
        *answer.exam_points,
    ]
    return " ".join(part for part in parts if part)


def classify_note(question: str, answer: ChatResponse) -> CategoryName:
    haystack = normalize_text(extract_note_search_text(question, answer))
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(normalize_text(keyword) in haystack for keyword in keywords):
            return category
    return "其他"


def create_history_record(question: str, answer: ChatResponse, title: str, is_note: bool = False) -> HistoryDetail:
    category = classify_note(question, answer) if is_note else None
    category_source = "auto" if is_note else None
    return HistoryDetail(
        id=str(uuid4()),
        title=title,
        question=question,
        created_at=datetime.now().isoformat(timespec="seconds"),
        is_note=is_note,
        category=category,
        category_source=category_source,
        answer=answer.model_copy(deep=True),
        supplements=[],
    )
```

- [ ] **Step 5: Re-run the smoke test**

Run: `pytest tests/test_note_classification_smoke.py -q`

Expected: PASS with the saved note returning `category`, `category_source`, and empty `supplements`.

- [ ] **Step 6: Commit**

```bash
git add backend/main.py tests/test_note_classification_smoke.py
git commit -m "feat: add note category metadata"
```

### Task 2: Add Category Update, Search, and Supplement Backend APIs

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Add failing smoke tests for search, category patch, and supplement append**

```python
def test_update_category_marks_manual():
    saved = client.post("/history/save-note", json=note_payload()).json()
    response = client.patch(f"/history/{saved['id']}/category", json={"category": "诉讼法"})
    assert response.status_code == 200
    body = response.json()
    assert body["category"] == "诉讼法"
    assert body["category_source"] == "manual"


def test_search_notes_matches_title_and_content():
    client.post("/history/save-note", json=note_payload())
    response = client.get("/notes/search", params={"q": "表见代理"})
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1
    assert body[0]["is_note"] is True


def test_append_supplement_keeps_original_answer():
    saved = client.post("/history/save-note", json=note_payload()).json()
    response = client.post(
        f"/history/{saved['id']}/supplements",
        json={"question": "再举一个例子"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["answer"]["definition"] == saved["answer"]["definition"]
    assert len(body["supplements"]) == 1
    assert body["supplements"][0]["question"] == "再举一个例子"
```

- [ ] **Step 2: Run the smoke tests and verify they fail**

Run: `pytest tests/test_note_detail_api_smoke.py -q`

Expected: FAIL because `/history/{id}/category`, `/notes/search`, and `/history/{id}/supplements` do not exist yet.

- [ ] **Step 3: Add request models and note search helpers**

```python
class UpdateCategoryRequest(BaseModel):
    category: CategoryName


class SupplementRequest(BaseModel):
    question: str

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("请输入补充问题")
        if len(cleaned) > 200:
            raise ValueError("问题不能超过200字")
        return cleaned


def build_note_document(record: HistoryDetail) -> str:
    supplement_parts = []
    for item in record.supplements:
        supplement_parts.extend(
            [
                item.question,
                item.answer.definition,
                item.answer.explanation,
                item.answer.example,
                *item.answer.elements,
                *item.answer.law,
                *item.answer.exam_points,
            ]
        )
    return normalize_text(
        " ".join(
            [
                record.title,
                extract_note_search_text(record.question, record.answer),
                " ".join(part for part in supplement_parts if part),
            ]
        )
    )
```

- [ ] **Step 4: Implement the new endpoints**

```python
@app.patch("/history/{record_id}/category", response_model=HistoryDetail)
def update_note_category(record_id: str, payload: UpdateCategoryRequest) -> HistoryDetail:
    record = get_history_detail(record_id)
    if not record.is_note:
        raise HTTPException(status_code=400, detail="只有笔记支持修改分类")
    record.category = payload.category
    record.category_source = "manual"
    return record


@app.get("/notes/search", response_model=list[HistorySummary])
def search_notes(q: str = "") -> list[HistorySummary]:
    keyword = normalize_text(q)
    notes = [item for item in history_store if item.is_note]
    if not keyword:
        return notes
    return [item for item in notes if keyword in build_note_document(item)]


@app.post("/history/{record_id}/supplements", response_model=HistoryDetail)
def add_note_supplement(record_id: str, payload: SupplementRequest) -> HistoryDetail:
    record = get_history_detail(record_id)
    if not record.is_note:
        raise HTTPException(status_code=400, detail="只有笔记支持追加补充")
    contextual_question = f"{record.question}。补充问题：{payload.question}"
    supplement_answer = generate_answer(contextual_question)
    record.supplements.insert(
        0,
        SupplementRecord(
            id=str(uuid4()),
            question=payload.question,
            created_at=datetime.now().isoformat(timespec="seconds"),
            answer=supplement_answer,
        ),
    )
    return record
```

- [ ] **Step 5: Update existing list/detail endpoints to keep returning note metadata**

Ensure `/history`, `/history/{id}`, and `/history/save-note` preserve `category`, `category_source`, and `supplements`:

```python
@app.get("/history", response_model=list[HistorySummary])
def get_history() -> list[HistorySummary]:
    return [
        HistorySummary(
            id=item.id,
            title=item.title,
            question=item.question,
            created_at=item.created_at,
            is_note=item.is_note,
            category=item.category,
            category_source=item.category_source,
        )
        for item in history_store
    ]
```

- [ ] **Step 6: Run the smoke tests**

Run: `pytest tests/test_note_detail_api_smoke.py -q`

Expected: PASS with category edits, search, and supplement append behaving as designed.

- [ ] **Step 7: Commit**

```bash
git add backend/main.py tests/test_note_detail_api_smoke.py
git commit -m "feat: add note search and supplement apis"
```

### Task 3: Add Frontend Note Types, Search State, and Grouped Note List

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`

- [ ] **Step 1: Add failing UI acceptance checklist**

Manually verify these expected failures before coding:

```text
1. 打开“笔记”页面时，没有搜索框。
2. 笔记列表没有显示分类，也没有按分类分组。
3. 搜索“表见代理”时，无法同时按标题和正文筛出结果。
```

- [ ] **Step 2: Add note category-aware frontend types and state**

Add these TypeScript definitions near the existing history types:

```ts
type NoteCategory =
  | '民法'
  | '刑法'
  | '行政法'
  | '诉讼法'
  | '商法/经济法'
  | '宪法/法理'
  | '其他'

type SupplementRecord = {
  id: string
  question: string
  answer: ChatResponse
  created_at: string
}

type HistorySummary = {
  id: string
  title: string
  question: string
  created_at: string
  is_note: boolean
  category?: NoteCategory | null
  category_source?: 'auto' | 'manual' | null
}

type HistoryDetail = HistorySummary & {
  answer: ChatResponse
  supplements?: SupplementRecord[]
}
```

Add note page state:

```ts
const noteSearchQuery = ref('')
const selectedNoteDetail = ref<HistoryDetail | null>(null)
const groupedNoteRecords = computed(() => {
  const groups = new Map<NoteCategory, HistorySummary[]>()
  const categoryOrder: NoteCategory[] = ['民法', '刑法', '行政法', '诉讼法', '商法/经济法', '宪法/法理', '其他']
  categoryOrder.forEach((category) => groups.set(category, []))
  noteRecords.value.forEach((item) => {
    const key = (item.category || '其他') as NoteCategory
    groups.get(key)?.push(item)
  })
  return categoryOrder
    .map((category) => ({ category, items: groups.get(category) || [] }))
    .filter((group) => group.items.length > 0)
})
```

- [ ] **Step 3: Add note search loader and integrate it with the notes page**

```ts
const savedNotes = ref<HistorySummary[]>([])

const noteRecords = computed(() => savedNotes.value.filter((item) => item.is_note))

async function loadSavedHistory() {
  const response = await fetch('http://127.0.0.1:8000/history')
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.detail || '网络异常，请重试')
  }
  const records = data as HistorySummary[]
  savedHistory.value = records
  savedNotes.value = records.filter((item) => item.is_note)
}

async function loadNoteResults() {
  const endpoint = noteSearchQuery.value.trim()
    ? `http://127.0.0.1:8000/notes/search?q=${encodeURIComponent(noteSearchQuery.value.trim())}`
    : 'http://127.0.0.1:8000/history'
  const response = await fetch(endpoint)
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.detail || '网络异常，请重试')
  }
  const records = data as HistorySummary[]
  savedNotes.value = records.filter((item) => item.is_note)
}
```

- [ ] **Step 4: Replace the flat note list with grouped category sections**

Update the notes template block:

```vue
<div class="note-toolbar">
  <input
    v-model="noteSearchQuery"
    class="note-search-input"
    type="search"
    placeholder="搜索笔记名称或内容"
    @input="handleNoteSearch"
  />
</div>

<div v-if="groupedNoteRecords.length" class="note-groups">
  <section v-for="group in groupedNoteRecords" :key="group.category" class="note-group">
    <div class="note-group-header">
      <h3>{{ group.category }}</h3>
      <span>{{ group.items.length }} 条</span>
    </div>
    <article v-for="item in group.items" :key="item.id" class="history-item">
      <button class="history-main" @click="openNoteDetail(item.id)">
        <strong>{{ item.title }}</strong>
        <p>{{ item.question }}</p>
        <span>{{ item.category }} · {{ formatDate(item.created_at) }}</span>
      </button>
      <div class="history-item-actions">
        <button class="mini-button" @click="openNoteDetail(item.id)">查看详情</button>
        <button class="mini-button" :disabled="loading" @click="renameNote(item)">重命名</button>
        <button class="mini-button" :disabled="loading" @click="deleteNote(item)">删除</button>
      </div>
    </article>
  </section>
</div>
```

- [ ] **Step 5: Style the grouped notes and search affordances**

Add focused CSS rules:

```css
.note-toolbar {
  margin-bottom: 20px;
}

.note-search-input {
  width: 100%;
  min-height: 48px;
  border: 1px solid rgba(176, 155, 109, 0.22);
  border-radius: 18px;
  background: rgba(255, 252, 245, 0.92);
  padding: 0 18px;
  font-size: 16px;
}

.note-groups {
  display: grid;
  gap: 22px;
}

.note-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
```

- [ ] **Step 6: Run the frontend build**

Run: `npm run build`

Expected: PASS and the notes page now shows a searchable, category-grouped note list.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.vue frontend/src/style.css
git commit -m "feat: group notes by category with search"
```

### Task 4: Build the Note Detail View and Note-Specific Editing Actions

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`

- [ ] **Step 1: Add failing UI acceptance checklist**

```text
1. 点击笔记后仍然直接跳进普通问答流，没有独立详情视图。
2. 无法修改笔记分类。
3. 无法在详情页看到已有补充记录。
```

- [ ] **Step 2: Add note detail loading and view switching**

Introduce a dedicated detail loader instead of reusing `openHistoryDetail`:

```ts
async function openNoteDetail(id: string) {
  loading.value = true
  loadingText.value = '正在加载笔记详情'
  errorMessage.value = ''
  try {
    const response = await fetch(`http://127.0.0.1:8000/history/${id}`)
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.detail || '网络异常，请重试'
      return
    }
    selectedNoteDetail.value = data as HistoryDetail
    switchPage('notes')
  } finally {
    loading.value = false
    loadingText.value = ''
  }
}
```

- [ ] **Step 3: Add rename/category/delete actions that keep detail view in sync**

```ts
const noteCategoryOptions: NoteCategory[] = ['民法', '刑法', '行政法', '诉讼法', '商法/经济法', '宪法/法理', '其他']

async function updateNoteCategory(category: NoteCategory) {
  if (!selectedNoteDetail.value) return
  const response = await fetch(`http://127.0.0.1:8000/history/${selectedNoteDetail.value.id}/category`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category }),
  })
  const data = await response.json()
  if (!response.ok) {
    errorMessage.value = data.detail || '网络异常，请重试'
    return
  }
  selectedNoteDetail.value = data as HistoryDetail
  await loadSavedHistory()
}
```

Keep rename/delete reusing the existing handlers, but when the selected record is the current note detail, refresh or clear `selectedNoteDetail.value` accordingly.

- [ ] **Step 4: Replace the note list panel with a master-detail layout**

Add a detail block in the notes template:

```vue
<section v-if="selectedNoteDetail" class="note-detail-card">
  <div class="note-detail-header">
    <div>
      <p class="result-label">{{ selectedNoteDetail.category || '其他' }}</p>
      <h2 class="result-title">{{ selectedNoteDetail.title }}</h2>
      <p class="note-detail-question">{{ selectedNoteDetail.question }}</p>
    </div>
    <div class="note-detail-actions">
      <button class="mini-button" @click="renameNote(selectedNoteDetail)">重命名</button>
      <button class="mini-button danger" @click="deleteNote(selectedNoteDetail)">删除</button>
    </div>
  </div>

  <label class="note-category-field">
    <span>分类</span>
    <select :value="selectedNoteDetail.category || '其他'" @change="updateNoteCategory(($event.target as HTMLSelectElement).value as NoteCategory)">
      <option v-for="category in noteCategoryOptions" :key="category" :value="category">{{ category }}</option>
    </select>
  </label>

  <div class="note-structured-grid">
    <article class="result-card"><h3>一句话定义</h3><p>{{ selectedNoteDetail.answer.definition }}</p></article>
    <article class="result-card"><h3>通俗解释</h3><p>{{ selectedNoteDetail.answer.explanation }}</p></article>
    <article class="result-card"><h3>构成要件</h3><ul><li v-for="item in selectedNoteDetail.answer.elements" :key="item">{{ item }}</li></ul></article>
    <article class="result-card"><h3>举例说明</h3><p>{{ selectedNoteDetail.answer.example }}</p></article>
    <article class="result-card"><h3>法条依据</h3><ul><li v-for="item in selectedNoteDetail.answer.law" :key="item">{{ item }}</li></ul></article>
    <article class="result-card"><h3>考试要点</h3><ul><li v-for="item in selectedNoteDetail.answer.exam_points" :key="item">{{ item }}</li></ul></article>
  </div>
```

- [ ] **Step 5: Render supplement history below the main note**

```vue
<section class="note-supplement-section">
  <div class="note-group-header">
    <h3>补充记录</h3>
    <span>{{ selectedNoteDetail.supplements?.length || 0 }} 条</span>
  </div>
  <div v-if="selectedNoteDetail.supplements?.length" class="supplement-list">
    <article v-for="item in selectedNoteDetail.supplements" :key="item.id" class="supplement-card">
      <p class="supplement-question">补充问题：{{ item.question }}</p>
      <p>{{ item.answer.definition }}</p>
      <p>{{ item.answer.explanation }}</p>
      <span>{{ formatDate(item.created_at) }}</span>
    </article>
  </div>
  <p v-else class="empty-history">这条笔记还没有补充记录。</p>
</section>
```

- [ ] **Step 6: Style the detail layout**

```css
.note-detail-card {
  display: grid;
  gap: 20px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 252, 245, 0.94);
  box-shadow: 0 20px 48px rgba(89, 74, 42, 0.08);
}

.note-structured-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.supplement-list {
  display: grid;
  gap: 14px;
}
```

- [ ] **Step 7: Run the frontend build**

Run: `npm run build`

Expected: PASS and clicking a note now opens a dedicated detail view with editable category and visible supplements.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/App.vue frontend/src/style.css
git commit -m "feat: add note detail view and editing"
```

### Task 5: Add “Continue Asking” in Note Detail and Final Verification

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`
- Modify: `backend/main.py`

- [ ] **Step 1: Add failing acceptance checklist**

```text
1. 在笔记详情页输入“再举一个例子”后，没有围绕当前笔记生成补充记录。
2. 追加补充后，原始结构化内容被覆盖或页面没有刷新。
3. 搜索时无法命中新补充内容。
```

- [ ] **Step 2: Add note follow-up composer state and submit action**

```ts
const noteFollowupQuestion = ref('')
const canSubmitNoteFollowup = computed(() => {
  return !loading.value && !!selectedNoteDetail.value && noteFollowupQuestion.value.trim().length > 0
})

async function submitNoteFollowup() {
  if (!selectedNoteDetail.value || !noteFollowupQuestion.value.trim()) {
    return
  }
  loading.value = true
  loadingText.value = '正在补充这条笔记'
  errorMessage.value = ''
  try {
    const response = await fetch(`http://127.0.0.1:8000/history/${selectedNoteDetail.value.id}/supplements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: noteFollowupQuestion.value.trim() }),
    })
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.detail || '网络异常，请重试'
      return
    }
    selectedNoteDetail.value = data as HistoryDetail
    noteFollowupQuestion.value = ''
    await loadSavedHistory()
  } finally {
    loading.value = false
    loadingText.value = ''
  }
}
```

- [ ] **Step 3: Add the detail-page supplement composer UI**

```vue
<section class="note-followup-card">
  <div>
    <p class="result-label">继续完善这条笔记</p>
    <h3>围绕当前笔记继续提问</h3>
  </div>
  <textarea
    v-model="noteFollowupQuestion"
    class="question-input"
    placeholder="例如：补充法条依据、再举一个例子、和相似概念再比较一下"
    :maxlength="config.max_length"
  />
  <div class="composer-actions">
    <span>{{ noteFollowupQuestion.length }}/{{ config.max_length }}</span>
    <button class="submit-button" :disabled="!canSubmitNoteFollowup" @click="submitNoteFollowup">追加补充</button>
  </div>
</section>
```

- [ ] **Step 4: Ensure backend search includes supplements and verify list refresh**

Recheck `build_note_document(record)` from Task 2 and make sure it includes supplement text before final verification. After a supplement is added, re-running `/notes/search?q=补充关键词` should return the same note.

- [ ] **Step 5: Style the follow-up composer**

```css
.note-followup-card {
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid rgba(176, 155, 109, 0.16);
  background: rgba(255, 251, 244, 0.9);
}
```

- [ ] **Step 6: Run final verification**

Run:

```bash
python3 -m py_compile backend/main.py
npm run build
pytest tests/test_note_classification_smoke.py tests/test_note_detail_api_smoke.py -q
```

Expected:
- `python3 -m py_compile backend/main.py` exits successfully
- `npm run build` exits successfully
- backend smoke tests PASS

- [ ] **Step 7: Commit**

```bash
git add backend/main.py frontend/src/App.vue frontend/src/style.css tests/test_note_classification_smoke.py tests/test_note_detail_api_smoke.py
git commit -m "feat: add note detail follow-up flow"
```
