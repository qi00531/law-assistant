<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <section class="space-y-6">
      <div class="surface-card px-6 py-6 sm:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Insights</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">学习洞察</h1>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          保留原有的洞察页面结构，但不再加载写死示例。真实数据接入后会自动填充。
        </p>
      </div>

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="surface-card px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">待复习</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">—</p>
          <p class="mt-2 text-xs text-slate-500">暂无记录</p>
        </div>
        <div class="surface-card px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">累计掌握</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">—</p>
          <p class="mt-2 text-xs text-slate-500">暂无记录</p>
        </div>
        <div class="surface-card px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">今日学习</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">—</p>
          <p class="mt-2 text-xs text-slate-500">暂无记录</p>
        </div>
        <div class="surface-card px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">本周学习</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">—</p>
          <p class="mt-2 text-xs text-slate-500">暂无记录</p>
        </div>
      </section>

      <section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
        <div class="surface-card px-6 py-6 sm:px-8">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-slate-900">学习记录</h2>
            <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Timeline</span>
          </div>
          <div class="mt-4 space-y-4">
            <div class="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
              <p class="text-sm font-semibold text-slate-800">暂无学习记录</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                当你在首页提问并保存结果后，这里会出现可复习的学习卡片。
              </p>
            </div>
          </div>
        </div>

        <div class="surface-card px-6 py-6 sm:px-8">
          <h2 class="text-lg font-semibold text-slate-900">学习趋势</h2>
          <div class="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
            <p class="text-sm font-semibold text-slate-800">暂无趋势数据</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">等累计学习记录后会自动生成。</p>
          </div>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div class="surface-card px-6 py-6 sm:px-8">
          <h2 class="text-lg font-semibold text-slate-900">易混概念</h2>
          <div class="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
            <p class="text-sm font-semibold text-slate-800">暂无易混点</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">当学习记录积累后自动提取。</p>
          </div>
        </div>

        <div class="surface-card px-6 py-6 sm:px-8">
          <h2 class="text-lg font-semibold text-slate-900">高频困惑</h2>
          <div class="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
            <p class="text-sm font-semibold text-slate-800">暂无困惑统计</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">当学习记录积累后自动提取。</p>
          </div>
        </div>
      </section>
    </section>
  </MainLayout>
</template>
