<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import type { LearningTrendPoint } from '../../data/mockInsightsData'

const props = defineProps<{
  items: LearningTrendPoint[]
}>()

const chartWidth = 620
const chartHeight = 210
const gradientId = `trend-area-${useId()}`
const activeStage = ref(props.items[0]?.stage ?? '')

const yMap: Record<LearningTrendPoint['status'], number> = {
  learned: 44,
  due: 160,
  upcoming: 122,
  stable: 68,
}

const stageColorMap: Record<LearningTrendPoint['status'], { ring: string; fill: string; chip: string }> = {
  learned: { ring: '#5f88c4', fill: '#ffffff', chip: 'bg-sky-50 text-sky-700' },
  due: { ring: '#c97316', fill: '#fff7ed', chip: 'bg-orange-50 text-orange-700' },
  upcoming: { ring: '#7c3aed', fill: '#faf5ff', chip: 'bg-violet-50 text-violet-700' },
  stable: { ring: '#0f8a6a', fill: '#ecfdf5', chip: 'bg-emerald-50 text-emerald-700' },
}

const chartCoordinates = computed(() =>
  props.items.map((item, index) => {
    const x = 36 + (index / Math.max(props.items.length - 1, 1)) * (chartWidth - 72)
    const y = yMap[item.status]

    return {
      ...item,
      x,
      y,
      point: `${x},${y}`,
      color: stageColorMap[item.status],
    }
  }),
)

const curvePath = computed(() =>
  chartCoordinates.value
    .map((item, index, items) => {
      if (index === 0) return `M ${item.x} ${item.y}`
      const prev = items[index - 1]
      const controlX = (prev.x + item.x) / 2
      return `C ${controlX} ${prev.y}, ${controlX} ${item.y}, ${item.x} ${item.y}`
    })
    .join(' '),
)

const activePoint = computed(
  () => chartCoordinates.value.find((item) => item.stage === activeStage.value) ?? chartCoordinates.value[0],
)
</script>

<template>
  <section class="surface-card overflow-hidden">
    <div class="border-b border-slate-100 bg-gradient-to-br from-[#fbf7ef] via-white to-[#f6f9fd] px-6 py-5">
      <p class="text-sm font-semibold text-slate-900">艾宾浩斯复习动线</p>
      <div class="mt-2 flex flex-wrap items-end justify-between gap-3">
        <p class="max-w-xl text-sm leading-6 text-slate-600">
          不是简单记录学了多少，而是把一张卡片从首次学习带到应复习、再到巩固阶段。沿着这条动线走，用户会更清楚下一步该复习哪一张卡。
        </p>
        <span class="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-brand shadow-sm">
          复习阶段总览
        </span>
      </div>
    </div>

    <div class="p-6">
      <div class="rounded-[28px] border border-[#eef2f7] bg-[#fcfdfd] p-4">
        <svg
          class="h-auto w-full"
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
          fill="none"
          preserveAspectRatio="none"
          role="img"
          aria-label="艾宾浩斯复习动线图"
        >
          <defs>
            <linearGradient :id="gradientId" x1="0" y1="0" :x2="chartWidth" :y2="chartHeight" gradientUnits="userSpaceOnUse">
              <stop stop-color="#7ea6da" stop-opacity="0.14" />
              <stop offset="0.45" stop-color="#f5b56f" stop-opacity="0.1" />
              <stop offset="1" stop-color="#56c4a2" stop-opacity="0.12" />
            </linearGradient>
          </defs>

          <path
            :d="curvePath"
            stroke="url(#gradientId)"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="12"
            opacity="0.35"
          />
          <path
            :d="curvePath"
            stroke="#587fb7"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="4"
          />

          <line
            v-for="item in chartCoordinates"
            :key="`${item.stage}-guide`"
            :x1="item.x"
            y1="184"
            :x2="item.x"
            :y2="item.y + 10"
            stroke="#dbe5ef"
            stroke-dasharray="4 6"
          />

          <g
            v-for="item in chartCoordinates"
            :key="item.stage"
            class="cursor-pointer"
            @click="activeStage = item.stage"
          >
            <circle :cx="item.x" :cy="item.y" r="14" :fill="item.color.fill" :stroke="item.color.ring" stroke-width="4" />
            <circle :cx="item.x" :cy="item.y" r="4" :fill="item.color.ring" />
            <text :x="item.x" y="198" text-anchor="middle" fill="#475569" font-size="12" font-weight="600">
              {{ item.stage }}
            </text>
          </g>
        </svg>
      </div>

      <div
        v-if="activePoint"
        class="mt-4 rounded-[22px] border border-slate-200 bg-white px-4 py-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm font-semibold text-slate-800">当前阶段知识点</p>
          <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="activePoint.color.chip">
            {{ activePoint.stage }}
          </span>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="topic in activePoint.topics"
            :key="topic"
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
          >
            {{ topic }}
          </span>
        </div>
      </div>

      <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <article
          v-for="item in items"
          :key="item.stage"
          class="rounded-[22px] border px-4 py-4"
          :class="{
            'border-sky-200 bg-sky-50/70': item.status === 'learned',
            'border-orange-200 bg-orange-50/80': item.status === 'due',
            'border-violet-200 bg-violet-50/80': item.status === 'upcoming',
            'border-emerald-200 bg-emerald-50/70': item.status === 'stable',
          }"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-semibold text-slate-700">{{ item.stage }}</p>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="stageColorMap[item.status].chip"
            >
              {{ item.window }}
            </span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.note }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
