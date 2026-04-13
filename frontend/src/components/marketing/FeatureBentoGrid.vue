<script setup lang="ts">
import MarketingIcon from './MarketingIcon.vue'

defineProps<{
  items: Array<{ title: string; description: string; icon: string; accent: string }>
}>()

const accentClasses: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  sky: 'bg-sky-100 text-sky-700',
  violet: 'bg-violet-100 text-violet-700',
  amber: 'bg-amber-100 text-amber-700',
  teal: 'bg-teal-100 text-teal-700',
}
</script>

<template>
  <section id="features" class="marketing-section grid gap-8 lg:grid-cols-[0.32fr_0.68fr]">
    <div class="space-y-4">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">02 / Capabilities</p>
      <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">核心能力</p>
      <h2 class="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
        不是聊天记录，而是一页一页可学习的法律知识结构
      </h2>
      <p class="max-w-sm text-sm leading-7 text-slate-600">
        我们把“法律问答”重新定义成一套更适合学习和复习的产品体验，而不是对话窗口里的临时回答。
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <article
        v-for="(item, index) in items"
        :key="item.title"
        class="marketing-glass group min-h-[240px] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.1)]"
        :class="[index === 0 ? 'lg:col-span-2' : '', index === 3 ? 'lg:col-span-2' : '']"
      >
        <div class="flex h-full flex-col justify-between gap-8">
          <div class="flex items-start justify-between gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="accentClasses[item.accent]">
              <MarketingIcon :name="item.icon" :color="'#0f172a'" :size="22" />
            </div>
            <span class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">0{{ index + 1 }}</span>
          </div>
          <div class="space-y-3">
            <h3 class="max-w-[16rem] text-xl font-semibold text-slate-900">{{ item.title }}</h3>
            <p class="text-sm leading-7 text-slate-600">{{ item.description }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
