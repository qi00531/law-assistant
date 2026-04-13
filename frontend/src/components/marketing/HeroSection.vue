<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  stats: Array<{ label: string; value: string }>
}>()
</script>

<template>
  <section class="marketing-section relative overflow-hidden rounded-[40px] px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
    <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
      <div class="absolute inset-x-10 top-0 h-40 rounded-full bg-cyan-200/40 blur-3xl" />
      <div class="absolute -right-16 top-24 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl" />
      <div class="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-sky-200/30 blur-3xl" />
      <div class="marketing-gridline absolute inset-0 opacity-40" />
    </div>

    <div class="relative z-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div class="space-y-7">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="marketing-chip">{{ eyebrow }}</span>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">01 / Product Manifesto</p>
        </div>
        <div class="space-y-5">
          <h1
            class="max-w-4xl font-serif text-4xl leading-[0.96] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-[5.2rem]"
          >
            {{ title }}
          </h1>
          <p class="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {{ description }}
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <a
            :href="primaryCta.href"
            class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
          >
            {{ primaryCta.label }}
          </a>
          <a
            :href="secondaryCta.href"
            class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
          >
            {{ secondaryCta.label }}
          </a>
        </div>

        <div class="grid gap-3 border-t border-white/70 pt-6 sm:grid-cols-3">
          <article
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-[24px] border border-white/80 bg-white/[0.72] px-4 py-4 backdrop-blur-md"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{{ stat.label }}</p>
            <p class="mt-3 text-sm leading-6 text-slate-700">{{ stat.value }}</p>
          </article>
        </div>
      </div>

      <div class="marketing-glass relative overflow-hidden p-4 lg:p-5">
        <div class="absolute -left-8 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 xl:block">
          Structured Learning Interface
        </div>

        <div class="rounded-[34px] bg-slate-950 p-5 text-white shadow-[0_30px_80px_rgba(15,23,42,0.34)]">
          <div class="flex items-center justify-between gap-4 text-xs text-slate-400">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span class="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <p class="uppercase tracking-[0.22em]">Learning Workspace</p>
          </div>

          <div class="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
            <div class="space-y-4">
              <div class="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">问题入口</p>
                <p class="mt-4 text-2xl font-semibold tracking-[-0.04em]">什么是不安抗辩权？</p>
                <p class="mt-3 text-sm leading-7 text-slate-300">
                  提问后，系统不会吐出一整段模糊答案，而是拆成概念、要件、法条、误区与相近概念对比。
                </p>
              </div>

              <article class="rounded-[28px] bg-white p-5 text-slate-900">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">概念总览</p>
                  <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">核心定义</span>
                </div>
                <p class="mt-4 text-sm leading-7 text-slate-700">
                  先履行一方在有确切证据证明对方履约能力明显下降时，可以中止履行并等待担保或能力恢复。
                </p>
              </article>
            </div>

            <div class="space-y-4">
              <article class="rounded-[28px] bg-emerald-50/95 p-5 text-slate-900">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">构成要件</p>
                <ul class="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                  <li>双方存在双务合同</li>
                  <li>一方负有先履行义务</li>
                  <li>对方履约能力明显下降</li>
                </ul>
              </article>

              <article class="rounded-[28px] bg-sky-50/95 p-5 text-slate-900">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">易混概念</p>
                <p class="mt-4 text-sm leading-7 text-slate-700">
                  先履行抗辩权针对到期不履行，不安抗辩权针对履约能力显著下降，启动条件并不相同。
                </p>
              </article>

              <article class="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">法条锚点</p>
                <p class="mt-4 text-sm leading-7 text-slate-200">《中华人民共和国民法典》第五百二十七条</p>
              </article>
            </div>
          </div>
        </div>

        <div
          class="absolute bottom-3 right-3 max-w-[220px] rounded-[24px] border border-white/90 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
        >
          不是聊天，而是把问题整理成真正能复习的学习结果。
        </div>
      </div>
    </div>
  </section>
</template>
