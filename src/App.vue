<template>
  <router-view v-slot="{ Component }">
  <!-- KeepAlive caches the components so they don't unmount -->
  <keep-alive>
    <component :is="Component" />
  </keep-alive>
</router-view></template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
