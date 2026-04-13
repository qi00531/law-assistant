<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const MAX_LENGTH = 200
const textareaId = 'home-question-input'
const props = withDefaults(
  defineProps<{
    modelValue: string
    buttonText?: string
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    buttonText: '开始学习',
    disabled: false,
    placeholder: '输入法律问题，例如：什么是不安抗辩权',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'submit', value: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const displayValue = computed(() => props.modelValue.slice(0, MAX_LENGTH))

const resize = () => {
  const element = textareaRef.value
  if (!element) return
  element.style.height = 'auto'
  const minHeight = 104
  const maxHeight = 220
  element.style.height = `${Math.min(Math.max(element.scrollHeight, minHeight), maxHeight)}px`
}

const handleInput = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  const nextValue = value.slice(0, MAX_LENGTH)
  if (nextValue !== value) {
    ;(event.target as HTMLTextAreaElement).value = nextValue
  }
  emit('update:modelValue', nextValue)
  resize()
}

const handleSubmit = () => {
  const value = displayValue.value.trim()
  if (!value || props.disabled) return
  emit('submit', value)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.isComposing || event.key === 'Process') return
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

watch(
  () => props.modelValue,
  async (value) => {
    if (value.length > MAX_LENGTH) {
      emit('update:modelValue', value.slice(0, MAX_LENGTH))
      return
    }
    await nextTick()
    resize()
  },
)

onMounted(() => {
  resize()
})
</script>

<template>
  <section>
    <label :for="textareaId" class="sr-only">法律问题输入</label>
    <div class="surface-mist overflow-hidden">
      <div class="px-5 pb-4 pt-5 sm:px-6 sm:pb-4 sm:pt-5">
        <textarea
          ref="textareaRef"
          :id="textareaId"
          :value="displayValue"
          :placeholder="placeholder"
          :maxlength="MAX_LENGTH"
          rows="2"
          class="min-h-[104px] w-full resize-none border border-transparent bg-transparent text-[17px] leading-8 text-slate-800 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:border-brand/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none"
          :disabled="disabled"
          @input="handleInput"
          @keydown="handleKeydown"
        />
      </div>

      <div class="flex justify-end border-t border-slate-200/70 px-5 py-4 sm:px-6">
        <div class="flex items-center">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            :disabled="disabled || !displayValue.trim()"
            @click="handleSubmit"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
