<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string
    size?: number
    color?: string
    alt?: string
  }>(),
  {
    size: 24,
    color: '#0f172a',
    alt: '',
  },
)

const src = `https://api.iconify.design/${props.name}.svg?color=${encodeURIComponent(props.color)}`
</script>

<template>
  <img :src="src" :alt="alt" :width="size" :height="size" class="shrink-0" loading="lazy" />
</template>
