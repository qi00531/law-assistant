<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  questions: string[]
}>()

const emit = defineEmits<{
  (event: 'select', question: string): void
}>()

const midpoint = computed(() => Math.ceil(props.questions.length / 2))

const topRow = computed(() => props.questions.slice(0, midpoint.value))
const bottomRow = computed(() => props.questions.slice(midpoint.value))
</script>

<template>
  <section class="space-y-4">
    <p class="text-center text-sm font-semibold tracking-[0.22em] text-slate-500">
      快速提问
    </p>

    <div class="relative space-y-3 overflow-hidden">
      <div
        class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white/95 to-transparent"
      />
      <div
        class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white/95 to-transparent"
      />

      <div class="rail-mask group/rail">
        <div class="marquee-row marquee-row--left">
          <div class="marquee-flow">
            <div class="marquee-track">
              <button
                v-for="question in topRow"
                :key="`top-${question}`"
                type="button"
                class="chip"
                @click="emit('select', question)"
              >
                {{ question }}
              </button>
            </div>
            <div class="marquee-track" aria-hidden="true">
              <button
                v-for="question in topRow"
                :key="`top-clone-${question}`"
                type="button"
                class="chip chip--clone"
                tabindex="-1"
                @click.prevent
              >
                {{ question }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="rail-mask group/rail">
        <div class="marquee-row marquee-row--right">
          <div class="marquee-flow">
            <div class="marquee-track">
              <button
                v-for="question in bottomRow"
                :key="`bottom-${question}`"
                type="button"
                class="chip"
                @click="emit('select', question)"
              >
                {{ question }}
              </button>
            </div>
            <div class="marquee-track" aria-hidden="true">
              <button
                v-for="question in bottomRow"
                :key="`bottom-clone-${question}`"
                type="button"
                class="chip chip--clone"
                tabindex="-1"
                @click.prevent
              >
                {{ question }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rail-mask {
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}

.marquee-row {
  overflow: hidden;
}

.marquee-flow {
  display: flex;
  width: max-content;
  will-change: transform;
}

.marquee-track {
  display: flex;
  gap: 0.75rem;
  padding-block: 0.125rem;
  padding-inline-end: 0.75rem;
}

.marquee-row--left .marquee-flow {
  animation: marquee-left 24s linear infinite;
}

.marquee-row--right .marquee-flow {
  animation: marquee-right 28s linear infinite;
}

.chip {
  flex: 0 0 auto;
  border-radius: 9999px;
  border: 1px solid rgb(226 232 240 / 0.8);
  background: rgb(255 255 255 / 0.84);
  padding: 0.9rem 1.1rem;
  text-align: left;
  font-size: 0.925rem;
  font-weight: 600;
  color: rgb(71 85 105);
  box-shadow:
    0 10px 26px rgb(15 23 42 / 0.06),
    inset 0 1px 0 rgb(255 255 255 / 0.85);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.chip--clone {
  pointer-events: none;
  user-select: none;
}

.chip:hover {
  transform: translateY(-2px);
  border-color: rgb(45 212 191 / 0.35);
  background: rgb(255 255 255 / 0.96);
  color: rgb(13 148 136);
  box-shadow:
    0 16px 34px rgb(15 23 42 / 0.08),
    0 0 0 1px rgb(45 212 191 / 0.14),
    inset 0 1px 0 rgb(255 255 255 / 0.94);
}

.chip:focus-visible {
  outline: 2px solid rgb(45 212 191 / 0.42);
  outline-offset: 2px;
}

.rail-mask:hover .marquee-flow,
.rail-mask:focus-within .marquee-flow {
  animation-play-state: paused;
}

@keyframes marquee-left {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@keyframes marquee-right {
  from {
    transform: translateX(-50%);
  }

  to {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-row--left .marquee-track,
  .marquee-row--right .marquee-track {
    animation: none;
  }
}
</style>
