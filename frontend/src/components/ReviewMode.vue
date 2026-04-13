<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { defaultReviewModeContent, type ReviewModeContent } from '../data/reviewModeData'

type ReviewStage = 'question' | 'hint' | 'rule' | 'misunderstanding' | 'reveal'

const stageOrder: ReviewStage[] = ['question', 'hint', 'rule', 'misunderstanding', 'reveal']

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    content?: ReviewModeContent
    initialStage?: ReviewStage
  }>(),
  {
    title: '复习模式',
    subtitle: '先回忆，再核对。',
    initialStage: 'question',
  },
)

const emit = defineEmits<{
  (e: 'state-change', stage: ReviewStage): void
  (e: 'complete', action: 'remembered' | 'review-later' | 'practice-more'): void
}>()

const reviewContent = computed(() => props.content ?? defaultReviewModeContent)
const stage = ref<ReviewStage>(props.initialStage)

watch(
  () => props.initialStage,
  (nextStage) => {
    stage.value = nextStage
  },
)

watch(stage, (nextStage) => {
  emit('state-change', nextStage)
})

const visibleStages = computed(() => {
  const activeIndex = stageOrder.indexOf(stage.value)
  return stageOrder.slice(0, activeIndex + 1)
})

const nextStage = computed<ReviewStage | null>(() => {
  const activeIndex = stageOrder.indexOf(stage.value)
  return activeIndex === stageOrder.length - 1 ? null : stageOrder[activeIndex + 1]
})

const isFinalStage = computed(() => stage.value === 'reveal')

const moveToNext = () => {
  if (!nextStage.value) return
  stage.value = nextStage.value
}

const resetFlow = () => {
  stage.value = 'question'
}

const handleComplete = (action: 'remembered' | 'review-later' | 'practice-more') => {
  emit('complete', action)
}
</script>

<template>
  <section class="surface-card overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
    <div class="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-3">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700"
          >
            Review Mode
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{{ title }}</h2>
            <p class="max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex w-fit items-center justify-center rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white"
          @click="resetFlow"
        >
          重新开始
        </button>
      </div>

      <div class="flex flex-col gap-4 sm:gap-5">
          <motion.article
            v-if="visibleStages.includes('question')"
            layout
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.34, delay: 0.06, ease: 'easeOut' }"
            class="rounded-[28px] border border-slate-200 bg-white px-5 py-6 text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:px-6"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span class="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                Question
              </span>
              <span class="text-xs uppercase tracking-[0.18em] text-slate-400">{{ reviewContent.topic }}</span>
            </div>

            <div class="mt-4 space-y-3">
              <h3 class="text-2xl font-semibold leading-tight tracking-tight sm:text-[1.9rem]">
                {{ reviewContent.question }}
              </h3>
              <p class="max-w-2xl text-sm leading-6 text-slate-500">
                先自己想一下。
              </p>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                @click="moveToNext"
              >
                开始核对
              </button>
            </div>
          </motion.article>

          <motion.article
            v-if="visibleStages.includes('hint')"
            layout
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.32, delay: 0.08, ease: 'easeOut' }"
            class="rounded-[26px] border border-slate-200 bg-white px-5 py-5 text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.03)] sm:px-6"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Hint
              </span>
              <span class="text-xs uppercase tracking-[0.18em] text-slate-400">提示</span>
            </div>

            <div class="mt-5 space-y-4">
              <p class="text-sm leading-6 text-slate-500">先看几个关键词。</p>
              <div class="flex flex-wrap gap-3">
                <span
                  v-for="item in reviewContent.hint"
                  :key="item"
                  class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </motion.article>

          <motion.article
            v-if="visibleStages.includes('rule')"
            layout
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.32, delay: 0.1, ease: 'easeOut' }"
            class="rounded-[26px] border border-slate-200 bg-white px-5 py-5 text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.03)] sm:px-6"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                Key Points
              </span>
              <span class="text-xs uppercase tracking-[0.18em] text-slate-400">关键点</span>
            </div>

            <div class="mt-5 space-y-4">
              <p class="text-sm leading-6 text-slate-500">看核心判断。</p>
              <ul class="space-y-3">
                <li
                  v-for="item in reviewContent.rule"
                  :key="item"
                  class="flex items-start gap-3 text-sm leading-6 text-slate-700"
                >
                  <span class="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </motion.article>

          <motion.article
            v-if="visibleStages.includes('misunderstanding')"
            layout
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.32, delay: 0.12, ease: 'easeOut' }"
            class="rounded-[26px] border border-slate-200 bg-white px-5 py-5 text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.03)] sm:px-6"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                Boundary
              </span>
              <span class="text-xs uppercase tracking-[0.18em] text-slate-400">易错点</span>
            </div>

            <div class="mt-5 space-y-4">
              <p class="text-sm leading-6 text-slate-500">注意这条边界。</p>
              <p class="text-base font-medium leading-7 text-slate-800">
                {{ reviewContent.misunderstanding }}
              </p>
            </div>
          </motion.article>

          <motion.article
            v-if="visibleStages.includes('reveal')"
            layout
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.34, delay: 0.12, ease: 'easeOut' }"
            class="rounded-[28px] border border-slate-200 bg-slate-950 px-5 py-6 text-white shadow-[0_12px_28px_rgba(15,23,42,0.10)] sm:px-6"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span class="rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Full Check
              </span>
              <span class="text-xs uppercase tracking-[0.18em] text-slate-400">完整核对</span>
            </div>

            <div class="mt-5 space-y-5">
              <div class="space-y-3">
                <h3 class="text-2xl font-semibold tracking-tight text-white">{{ reviewContent.topic }}</h3>
                <p class="text-sm leading-7 text-slate-300">
                  {{ reviewContent.explanation }}
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-[24px] bg-white/6 px-4 py-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">法条</p>
                  <p class="mt-3 text-sm leading-6 text-slate-200">{{ reviewContent.statute }}</p>
                </div>
                <div class="rounded-[24px] bg-white/6 px-4 py-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">示例</p>
                  <p class="mt-3 text-sm leading-6 text-slate-200">{{ reviewContent.example }}</p>
                </div>
              </div>
            </div>
          </motion.article>
      </div>

      <div class="flex flex-col gap-4 border-t border-white/80 pt-5">
        <div v-if="!isFinalStage" class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            @click="moveToNext"
          >
            {{
              stage === 'hint'
                ? '继续看关键条件'
                : stage === 'rule'
                  ? '看常见误区'
                  : stage === 'misunderstanding'
                    ? '查看完整解释'
                    : '继续'
            }}
          </button>
          <p class="flex items-center text-sm leading-7 text-slate-500">
            当前阶段：<span class="ml-2 font-medium text-slate-700">{{ stage }}</span>
          </p>
        </div>

        <div v-else class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-400"
            @click="handleComplete('remembered')"
          >
            我记住了
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            @click="handleComplete('review-later')"
          >
            稍后再复习
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            @click="handleComplete('practice-more')"
          >
            继续练习相关问题
          </button>
        </div>

        <p class="text-sm leading-6 text-slate-500">
          顺序很简单：先想，再看提示，最后核对。
        </p>
      </div>
    </div>
  </section>
</template>
