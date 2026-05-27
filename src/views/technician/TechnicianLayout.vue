<template>
  <div class="min-h-screen flex bg-gray-50">
    <aside class="w-64 bg-primary-900 text-white flex flex-col shrink-0">
      <div class="p-5 border-b border-primary-800">
        <RouterLink to="/" class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 bg-accent-400 rounded-lg flex items-center justify-center font-bold text-primary-900">M</div>
          <span class="font-bold tracking-tight">MedLab<span class="text-accent-400">System</span></span>
        </RouterLink>
        <div class="flex items-center gap-3 bg-primary-800 rounded-xl p-3">
          <div class="w-9 h-9 bg-green-400 rounded-full flex items-center justify-center text-xl">🔬</div>
          <div>
            <p class="text-sm font-semibold">Technician Portal</p>
            <p class="text-xs text-primary-400">Lab Staff Access</p>
          </div>
        </div>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <NavItem to="/technician/dashboard" icon="📊" label="Dashboard" />
        <NavItem to="/technician/queue"     icon="📥" label="Test Queue" />
        <NavItem to="/technician/results"   icon="📄" label="Results" />
        <NavItem to="/technician/directory" icon="👨‍🔬" label="Technicians" />
      </nav>
      <div class="p-4 border-t border-primary-800">
        <RouterLink to="/" class="flex items-center gap-2 text-primary-400 hover:text-white text-sm transition-colors px-3 py-2 rounded-lg hover:bg-primary-800">← Back to Home</RouterLink>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-gray-900">Technician Portal</h1>
        <span class="text-sm text-gray-500">{{ today }}</span>
      </header>
      <main class="flex-1 p-6 overflow-auto"><RouterView /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import NavItem from '@/components/NavItem.vue'
const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
</script>
