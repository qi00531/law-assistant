<script setup lang="ts">
import { motion } from 'motion-v'

const particles = [
  { left: '8%', top: '16%', delay: 0, size: 8 },
  { left: '20%', top: '30%', delay: 1.1, size: 10 },
  { left: '34%', top: '12%', delay: 0.5, size: 7 },
  { left: '46%', top: '24%', delay: 1.6, size: 9 },
  { left: '58%', top: '14%', delay: 0.8, size: 12 },
  { left: '72%', top: '28%', delay: 1.9, size: 7 },
  { left: '82%', top: '18%', delay: 1.3, size: 10 },
  { left: '64%', top: '42%', delay: 0.3, size: 8 },
]

const valuePoints = [
  {
    number: '01',
    title: '问题拆解',
    description: '把一个问题拆成清晰的理解入口，而不是返回一整段难以吸收的答案。',
  },
  {
    number: '02',
    title: '知识重组',
    description: '从概念、法条、边界到易混点，重新组织成自然的学习顺序。',
  },
  {
    number: '03',
    title: '学习沉淀',
    description: '每一次结果都可以进入笔记体系，逐渐积累成属于你的法律知识结构。',
  },
]

const workflow = [
  {
    step: '提出问题',
    detail: '从真实困惑进入',
  },
  {
    step: '结构化讲解',
    detail: '系统重组知识层次',
  },
  {
    step: '沉淀为体系',
    detail: '形成长期可复习资产',
  },
]
</script>

<template>
  <main class="marketing-shell marketing-homepage">
    <header class="relative z-20">
      <nav
        class="mx-auto flex w-full max-w-[1320px] items-center justify-between rounded-full border border-slate-200/70 bg-white/[0.88] px-5 py-3 backdrop-blur-xl sm:px-6"
      >
        <div class="flex items-center gap-3">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold tracking-[0.18em] text-white">
            法
          </span>
          <div class="leading-none">
            <p class="text-sm font-semibold text-slate-950">Law Assistant</p>
            <p class="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">AI Legal Learning</p>
          </div>
        </div>

        <div class="hidden items-center gap-8 text-sm font-medium text-slate-500 lg:flex">
          <a href="#value" class="transition hover:text-slate-950">价值</a>
          <a href="#showcase" class="transition hover:text-slate-950">产品</a>
          <a href="#workflow" class="transition hover:text-slate-950">流程</a>
        </div>

        <a
          href="/home"
          class="inline-flex items-center justify-center rounded-full bg-[#214d8a] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-[#214d8a] hover:to-[#2f8c83]"
        >
          开始学习
        </a>
      </nav>
    </header>

    <section class="relative isolate overflow-hidden pt-10 lg:pt-16">
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute left-1/2 top-0 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-sky-100/35 blur-3xl" />
        <div class="absolute left-[14%] top-[26%] h-40 w-40 rounded-full bg-sky-100/28 blur-3xl" />
        <div class="absolute right-[10%] top-[16%] h-52 w-52 rounded-full bg-emerald-100/22 blur-3xl" />

        <svg class="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 1440 760" fill="none" preserveAspectRatio="none">
          <path d="M120 132C280 168 364 112 506 166C632 214 692 318 840 322C1000 328 1074 222 1246 246" stroke="rgba(122,146,160,0.16)" />
          <path d="M174 374C292 330 430 386 552 350C706 304 806 206 958 232C1090 254 1162 350 1312 336" stroke="rgba(122,146,160,0.12)" />
          <path d="M228 554C346 482 468 540 622 512C784 482 890 396 1014 412C1128 426 1184 482 1308 462" stroke="rgba(122,146,160,0.09)" />
        </svg>

        <motion.div
          v-for="particle in particles"
          :key="`${particle.left}-${particle.top}`"
          class="absolute rounded-full border border-sky-100/80 bg-white/[0.88] shadow-[0_0_0_5px_rgba(255,255,255,0.08)]"
          :style="{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }"
          :animate="{
            y: [0, -14, 0],
            x: [0, 8, 0],
            opacity: [0.45, 0.95, 0.45],
            scale: [1, 1.18, 1],
          }"
          :transition="{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }"
        />
      </div>

      <div class="grid items-center gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
        <div class="relative z-10 space-y-8">
          <p class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/[0.88] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#2a5f96]">
            Legal Learning Engine
          </p>

          <div class="space-y-6">
            <h1 class="max-w-[14ch] text-[38px] font-normal leading-[1.5] tracking-[0.08em] text-[#333333] sm:text-[42px] lg:text-[44px]">
              把法律问题，变成一个可掌握的系统。
            </h1>
            <p class="max-w-xl text-[17px] font-normal leading-[1.8] tracking-[0.01em] text-slate-600">
              结构化讲解、知识重组、持续沉淀。像高端科技产品一样克制，也像真正的学习工具一样有结果。
            </p>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="/home"
              class="inline-flex items-center justify-center rounded-full bg-[#214d8a] px-8 py-3.5 text-[16px] font-medium text-white transition hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-[#214d8a] hover:to-[#2f8c83]"
            >
              开始学习
            </a>
            <p class="text-sm uppercase tracking-[0.2em] text-slate-400">不是聊天界面，是学习界面</p>
          </div>
        </div>

        <motion.div
          class="relative"
          :animate="{ y: [0, -14, 0] }"
          :transition="{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }"
        >
          <div class="absolute left-8 top-10 h-48 w-48 rounded-full bg-sky-100/34 blur-3xl" />
          <div class="absolute bottom-4 right-8 h-56 w-56 rounded-full bg-emerald-100/22 blur-3xl" />

          <div class="relative rounded-[44px] border border-white/80 bg-white/[0.72] p-4 backdrop-blur-2xl">
            <div
              class="overflow-hidden rounded-[38px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_24%),linear-gradient(180deg,#06101c_0%,#0c1727_52%,#0f1a2d_100%)] p-5 text-white shadow-[0_36px_90px_rgba(15,23,42,0.22)] sm:p-6"
            >
              <div class="flex items-center justify-between text-[11px] uppercase tracking-[0.26em] text-slate-400">
                <div class="flex items-center gap-2">
                  <span class="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span class="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span>Learning Surface</span>
              </div>

              <div class="mt-8 grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
                <motion.div
                  class="space-y-6"
                  :animate="{ y: [0, -8, 0] }"
                  :transition="{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }"
                >
                  <div class="rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-6">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">Question</p>
                    <p class="mt-4 text-xl font-semibold leading-[1.45] tracking-[0.01em] text-white">
                      什么是不安抗辩权？
                    </p>
                    <p class="mt-4 max-w-[30ch] text-sm leading-[1.7] tracking-[0.01em] text-slate-300">
                      系统不会展开对话泡泡，而是把它拆成一套清晰的学习层级。
                    </p>
                  </div>

                  <div class="rounded-[28px] bg-white px-5 py-6 text-slate-900">
                    <div class="flex items-center justify-between gap-3">
                      <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Concept</p>
                      <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Structured</span>
                    </div>
                    <p class="mt-4 text-sm leading-[1.7] tracking-[0.01em] text-slate-600">
                      先履行一方在有确切证据证明对方履约能力明显下降时，可以中止履行。
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  class="space-y-6"
                  :animate="{ y: [0, 10, 0] }"
                  :transition="{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }"
                >
                  <div class="rounded-[28px] bg-emerald-50/[0.96] px-5 py-6 text-slate-900">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Elements</p>
                    <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                      <li>双方存在双务合同</li>
                      <li>一方负有先履行义务</li>
                      <li>对方履约能力明显下降</li>
                    </ul>
                  </div>

                  <div class="rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-6">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Boundary</p>
                    <p class="mt-4 text-sm leading-[1.7] tracking-[0.01em] text-slate-300">
                      与先履行抗辩权不同，它的关键在于对方履约能力的下降风险。
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                class="pointer-events-none absolute inset-x-10 top-[38%] h-px bg-gradient-to-r from-transparent via-emerald-200/60 to-transparent"
                :animate="{ opacity: [0.18, 0.72, 0.18], x: [-24, 24, -24] }"
                :transition="{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }"
              />
            </div>

            <motion.div
              class="absolute -bottom-4 right-4 max-w-[240px] rounded-[26px] border border-white/90 bg-white/[0.92] px-4 py-3 text-sm leading-6 text-slate-600 backdrop-blur-xl"
              :animate="{ y: [0, -6, 0] }"
              :transition="{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }"
            >
              学习结果以模块而不是对话存在。
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>

    <section id="value" class="py-28 lg:py-36">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Core Value</p>
        <h2 class="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
          少说一点，让结果更有力量。
        </h2>
      </div>

      <div class="mt-16 grid gap-6 lg:grid-cols-3 xl:gap-8">
        <div
          v-for="item in valuePoints"
          :key="item.title"
          class="rounded-[28px] border border-slate-200/70 bg-white/[0.82] px-6 py-6 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#2a5f96]">{{ item.number }}</p>
          <div class="mt-6 space-y-4">
            <h3 class="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{{ item.title }}</h3>
            <p class="max-w-[24ch] text-sm leading-[1.7] tracking-[0.01em] text-slate-500">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="showcase" class="py-12 lg:py-20">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Product Showcase</p>
        <h2 class="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
          整个页面，只保留一个真正的视觉中心。
        </h2>
      </div>

      <motion.div
        class="relative mt-16"
        :initial="{ opacity: 0, y: 30 }"
        :whileInView="{ opacity: 1, y: 0 }"
        :viewport="{ once: true, amount: 0.3 }"
        :transition="{ duration: 0.8, ease: 'easeOut' }"
      >
        <div class="absolute left-1/2 top-8 h-56 w-[42rem] -translate-x-1/2 rounded-full bg-sky-100/30 blur-3xl" />
        <div class="relative mx-auto max-w-[1180px] rounded-[44px] border border-white/80 bg-white/[0.72] p-4 backdrop-blur-2xl sm:p-6">
          <div
            class="relative overflow-hidden rounded-[38px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.12),transparent_20%),linear-gradient(180deg,#06101c_0%,#0b1523_50%,#10192b_100%)] px-6 py-7 text-white sm:px-8 sm:py-8"
          >
            <motion.div
              class="absolute inset-y-0 left-[18%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"
              :animate="{ opacity: [0.08, 0.26, 0.08] }"
              :transition="{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }"
            />
            <motion.div
              class="absolute inset-x-0 top-[42%] h-px bg-gradient-to-r from-transparent via-emerald-200/60 to-transparent"
              :animate="{ opacity: [0.12, 0.8, 0.12], x: [-48, 48, -48] }"
              :transition="{ duration: 6, repeat: Infinity, ease: 'easeInOut' }"
            />

            <div class="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
              <div class="space-y-7">
                <p class="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">Product System</p>
                <h3 class="text-4xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-5xl">
                  法律学习，不该停留在回答层。
                </h3>
                <p class="max-w-sm text-base leading-8 text-slate-300">
                  一个大型深色面板承载整个学习动作。输入、理解、归纳与沉淀，都在同一套界面节奏里完成。
                </p>

                <div class="space-y-4 pt-4 text-sm leading-7 text-slate-300">
                  <p>01. 问题进入后立即被拆成学习模块。</p>
                  <p>02. 重点内容被压缩成更清晰的知识层次。</p>
                  <p>03. 结果自然延展为个人笔记资产。</p>
                </div>
              </div>

              <div class="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
                <motion.div
                  class="space-y-6"
                  :animate="{ y: [0, -10, 0] }"
                  :transition="{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }"
                >
                  <div class="rounded-[30px] border border-white/10 bg-white/[0.05] px-5 py-6">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Input Layer</p>
                    <div class="mt-5 rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 text-base text-slate-200">
                      表见代理和无权代理的区别是什么？
                    </div>
                  </div>

                  <div class="rounded-[30px] bg-white px-5 py-6 text-slate-900">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Knowledge Output</p>
                    <p class="mt-5 text-sm leading-[1.7] tracking-[0.01em] text-slate-600">
                      概念、法条、边界与误区被重组为统一界面，不出现冗长聊天记录。
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  class="space-y-6"
                  :animate="{ y: [0, 12, 0] }"
                  :transition="{ duration: 7.4, repeat: Infinity, ease: 'easeInOut' }"
                >
                  <div class="rounded-[30px] bg-emerald-50/[0.96] px-5 py-6 text-slate-900">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Note Capture</p>
                    <p class="mt-5 text-sm leading-[1.7] tracking-[0.01em] text-slate-600">
                      每次结果都可以被保存、筛选和回看，逐渐形成稳定的个人知识体系。
                    </p>
                  </div>

                  <div class="rounded-[30px] border border-white/10 bg-white/[0.05] px-5 py-6">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Review Rhythm</p>
                    <p class="mt-5 text-sm leading-[1.7] tracking-[0.01em] text-slate-300">
                      结果天然适合后续复习与比较，而不是只在提问当下出现一次。
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>

    <section id="workflow" class="py-28 lg:py-36">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Workflow</p>
        <h2 class="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
          三个动作，完成一次完整学习闭环。
        </h2>
      </div>

      <div class="mt-20">
        <div class="hidden items-center lg:flex">
          <motion.div
            v-for="(step, index) in workflow"
            :key="step.step"
            class="flex flex-1 items-center"
            :initial="{ opacity: 0, y: 20 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true, amount: 0.5 }"
            :transition="{ duration: 0.65, delay: index * 0.12, ease: 'easeOut' }"
          >
            <div class="min-w-[220px]">
              <div class="flex items-center gap-4">
                <div class="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200/80 bg-white/[0.82] text-sm font-semibold tracking-[0.22em] text-emerald-700">
                  0{{ index + 1 }}
                </div>
                <div class="space-y-2">
                  <h3 class="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{{ step.step }}</h3>
                  <p class="text-sm leading-7 text-slate-500">{{ step.detail }}</p>
                </div>
              </div>
            </div>

            <motion.div
              v-if="index < workflow.length - 1"
              class="relative mx-6 h-px flex-1 bg-slate-200"
              :animate="{ opacity: [0.35, 0.9, 0.35] }"
              :transition="{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }"
            >
              <motion.div
                class="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-emerald-400"
                :animate="{ x: ['0%', '100%'] }"
                :transition="{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }"
              />
            </motion.div>
          </motion.div>
        </div>

        <div class="space-y-8 lg:hidden">
          <motion.div
            v-for="(step, index) in workflow"
            :key="step.step"
            class="relative pl-16"
            :initial="{ opacity: 0, y: 18 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true, amount: 0.5 }"
            :transition="{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }"
          >
            <div v-if="index < workflow.length - 1" class="absolute left-[1.95rem] top-16 h-[calc(100%+1.5rem)] w-px bg-slate-200" />
            <div class="absolute left-0 top-0 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200/80 bg-white/[0.82] text-sm font-semibold tracking-[0.22em] text-emerald-700">
              0{{ index + 1 }}
            </div>
            <h3 class="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{{ step.step }}</h3>
            <p class="mt-3 text-sm leading-7 text-slate-500">{{ step.detail }}</p>
          </motion.div>
        </div>
      </div>
    </section>

    <section class="pb-16 pt-6 lg:pb-24">
      <div class="mx-auto max-w-[980px] text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Final CTA</p>
        <h2 class="mx-auto mt-5 max-w-[11ch] text-4xl font-semibold leading-tight tracking-[-0.055em] text-slate-950 sm:text-5xl">
          从一个问题开始，建立你自己的法律知识系统。
        </h2>
        <a
          href="/home"
          class="mt-10 inline-flex items-center justify-center rounded-full bg-[#214d8a] px-8 py-3.5 text-[16px] font-medium text-white transition hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-[#214d8a] hover:to-[#2f8c83]"
        >
          开始学习
        </a>
      </div>
    </section>
  </main>
</template>
