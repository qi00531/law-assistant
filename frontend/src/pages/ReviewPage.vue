<script setup lang="ts">
import ReviewMode from '../components/ReviewMode.vue'
import { useReviewSession } from '../composables/useReviewSession'
import MainLayout from '../layouts/MainLayout.vue'
import { router } from '../router'

const { reviewContent, reviewTitle, reviewSubtitle, clearReviewSession } = useReviewSession()

const handleBack = () => {
  clearReviewSession()
  void router.back()
}

const handleComplete = () => {
  clearReviewSession()
}
</script>

<template>
  <MainLayout>
    <section class="space-y-5">
      <div class="flex items-center justify-between gap-3">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Review Mode</p>
          <h1 class="text-3xl font-semibold tracking-tight text-slate-900">{{ reviewTitle }}</h1>
          <p v-if="reviewSubtitle" class="text-sm leading-6 text-slate-500">{{ reviewSubtitle }}</p>
        </div>
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
          @click="handleBack"
        >
          返回
        </button>
      </div>

      <ReviewMode
        :content="reviewContent ?? undefined"
        :title="reviewTitle"
        :subtitle="reviewSubtitle"
        @complete="handleComplete"
      />
    </section>
  </MainLayout>
</template>
