<script setup lang="ts">
defineProps<{
  placeholderImage: string
}>()
</script>

<template>
  <section id="product-preview" class="marketing-section space-y-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="max-w-2xl space-y-3">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">产品预览</p>
        <h2 class="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
          从提问到笔记，界面始终围绕“学习”而不是“闲聊”
        </h2>
      </div>

      <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">05 / Product Preview</p>
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
      <div class="marketing-glass overflow-hidden p-4 sm:p-5">
        <div class="rounded-[34px] bg-slate-950 p-5 text-white shadow-[0_28px_80px_rgba(15,23,42,0.3)] sm:p-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Core Device</p>
              <h3 class="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Learning Capsule Interface</h3>
            </div>
            <div class="hidden rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:inline-flex">
              Structured output
            </div>
          </div>

          <div class="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div class="space-y-4">
              <div class="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Question Board</p>
                <p class="mt-4 text-xl font-semibold tracking-[-0.03em] text-white">善意取得与无权处分有什么区别？</p>
                <div class="mt-5 flex flex-wrap gap-2">
                  <span class="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200">概念</span>
                  <span class="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200">构成要件</span>
                  <span class="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200">法条</span>
                  <span class="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200">误区</span>
                </div>
              </div>

              <div class="rounded-[28px] bg-white p-5 text-slate-900">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">学习结果模块</p>
                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                  <div class="rounded-[22px] bg-slate-50 p-4">
                    <p class="text-sm font-semibold text-slate-900">概念说明</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">先看权利基础，再区分善意取得与处分行为的效力路径。</p>
                  </div>
                  <div class="rounded-[22px] bg-slate-50 p-4">
                    <p class="text-sm font-semibold text-slate-900">对比理解</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">系统自动把易混点折叠成对照表，方便记忆与回顾。</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <article class="rounded-[28px] bg-emerald-50/95 p-5 text-slate-900">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Note Sync</p>
                <div class="mt-4 space-y-3">
                  <div class="rounded-[20px] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                    <p class="text-sm font-semibold text-slate-900">不安抗辩权</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">保存后自动带上摘要、标签和重点数量，直接进入笔记页。</p>
                  </div>
                  <div class="rounded-[20px] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                    <p class="text-sm font-semibold text-slate-900">合同解除</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">形成一个能继续复习、筛选和积累的知识库，而不是一次性回答。</p>
                  </div>
                </div>
              </article>

              <article class="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Product Rhythm</p>
                <p class="mt-4 text-sm leading-7 text-slate-300">
                  输入、理解、保存、回看被压缩在同一套界面节奏里，让学习动作更像连续操作，而不是跳转流程。
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="marketing-glass p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">视觉说明</p>
          <p class="mt-4 text-sm leading-7 text-slate-600">
            我们保留当前浅雾青绿色调，但把内容组织切成更像“单产品官网”的章节叙事和装置式界面展示。
          </p>
        </div>

        <div class="marketing-glass overflow-hidden p-3">
          <img
            :src="placeholderImage"
            alt="产品占位预览图"
            class="h-full w-full rounded-[28px] object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>
