<template>
  <div class="min-h-screen flex bg-gray-50">
    <aside class="w-64 bg-primary-900 text-white flex flex-col shrink-0">
      <div class="p-5 border-b border-primary-800">
        <RouterLink to="/" class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 bg-accent-400 rounded-lg flex items-center justify-center font-bold text-primary-900">M</div>
          <span class="font-bold tracking-tight">MedLab<span class="text-accent-400">System</span></span>
        </RouterLink>
        <div class="flex items-center gap-3 bg-primary-800 rounded-xl p-3">
          <div class="w-9 h-9 bg-accent-400 rounded-full flex items-center justify-center text-xl">🧑‍⚕️</div>
          <div>
            <p class="text-sm font-semibold">{{ patientName || 'Patient Portal' }}</p>
            <p class="text-xs text-primary-400">Patient Access</p>
          </div>
        </div>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <NavItem to="/patient/dashboard" icon="📊" label="Dashboard" />
        <NavItem to="/patient/requests"  icon="📋" label="My Requests" />
        <NavItem to="/patient/directory" icon="👤" label="My Profile" />
      </nav>
      <div class="p-4 border-t border-primary-800">
        <RouterLink to="/" class="flex items-center gap-2 text-primary-400 hover:text-white text-sm transition-colors px-3 py-2 rounded-lg hover:bg-primary-800">← Back to Home</RouterLink>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-gray-900">Patient Portal</h1>
        <span class="text-sm text-gray-500">{{ today }}</span>
      </header>
      <main class="flex-1 p-6 overflow-auto"><RouterView /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import NavItem from '@/components/NavItem.vue'
import { supabase } from '@/api/supabase'

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const patientName = ref('')

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data } = await supabase
    .from('Patient')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .maybeSingle()
  if (data) patientName.value = `${data.first_name} ${data.last_name}`
})
</script>
