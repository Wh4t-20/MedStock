<template>
  <div class="card p-5 flex items-start gap-4">
    <div>
      <p class="text-sm text-gray-500 font-medium">{{ label }}</p>
      <p class="text-3xl font-bold text-gray-900 mt-0.5">{{ value }}</p>
      <p v-if="sub" class="text-xs text-gray-400 mt-1">{{ sub }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label:   string
  value:   number | string
  sub?:    string
  iconBg?: string
}>()
</script>
