<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <section class="surface-card px-6 py-10 sm:px-8 sm:py-12">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Insights</p>
        <h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-900">学习洞察暂未启用</h1>
        <p class="mt-4 text-sm leading-7 text-slate-600">
          这个页面原先展示的是演示用静态数据。为了避免线上继续出现假记录，现已切换为空状态，后续接入真实学习统计后再开放。
        </p>

        <div class="mt-8 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-left">
          <p class="text-sm font-semibold text-slate-800">当前可用的数据来源</p>
          <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>问答结果会在首页实时生成。</li>
            <li>保存后的笔记会在“我的笔记”页展示。</li>
            <li>学习洞察会等真实统计接口就绪后再恢复。</li>
          </ul>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
