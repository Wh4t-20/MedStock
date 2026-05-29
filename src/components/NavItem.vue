<template>
  <RouterLink :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors overflow-hidden whitespace-nowrap"
    :class="isActive
       ? 'bg-white/10 text-white border-l-2 border-[#F5A623] pl-[10px]'
          : 'text-white/60 hover:bg-white/5 hover:text-white'">
    <component :is="icon" class="w-5 h-5 shrink-0" />
    <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
      {{ label }}
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { Component } from 'vue'

const props = defineProps<{ to: string; icon: Component; label: string }>()
const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>