<template>
  <RouterLink :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
    :class="isActive
      ? 'bg-accent-400 text-primary-900'
      : 'text-primary-300 hover:text-white hover:bg-primary-800'">
    <span>{{ icon }}</span>
    <span>{{ label }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps<{ to: string; icon: string; label: string }>()
const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>
