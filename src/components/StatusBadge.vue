<template>
  <span :class="badgeClass">{{ status }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()

const badgeClass = computed(() => {
  switch (props.status) {
    case 'Pending':     return 'badge-pending'
    case 'In Progress': return 'badge-progress'
    case 'Completed':   return 'badge-completed'
    case 'Cancelled':   return 'badge-cancelled'
    default:            return 'badge bg-gray-100 text-gray-700'
  }
})
</script>
