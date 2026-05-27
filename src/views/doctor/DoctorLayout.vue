<template>
  <div class="min-h-screen flex bg-gray-50 font-public-sans">
    <aside class="group/sidebar w-20 hover:w-64 bg-[#1A1F3A] text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-10">
      
      <div class="px-5 pt-6 pb-5 border-b border-white/10 h-[88px] flex flex-col justify-center shrink-0">
        <RouterLink to="/" class="font-public-sans font-bold text-xl tracking-tight flex items-center gap-2 whitespace-nowrap">
          <Activity class="w-6 h-6 text-[#F5A623] shrink-0" />
          
          <div class="flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ease-in-out">
            <div class="flex items-center gap-0.5">
              <span class="text-white">Med</span><span class="text-[#F5A623]">Stock</span>
            </div>
            <p class="text-white/40 text-[10px] font-mono uppercase tracking-widest leading-none mt-1">
              The Synergy Pulse
            </p>
          </div>
        </RouterLink>
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
        <NavItem to="/doctor/dashboard"  :icon="LayoutDashboard" label="Dashboard" />
        <NavItem to="/doctor/requests"   :icon="ClipboardList"   label="Lab Requests" />
        <NavItem to="/doctor/patients"   :icon="Users"           label="Patients" />
        <NavItem to="/doctor/doctors"    :icon="UserRound"       label="Doctors" />
        <NavItem to="/doctor/test-types" :icon="FlaskConical"     label="Test Types" />
      </nav>

      <div class="p-4 border-t border-white/10 shrink-0">
        <RouterLink to="/" class="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/5 whitespace-nowrap">
          <ArrowLeft class="w-4 h-4 shrink-0" />
          <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ease-in-out">
            Back to Home
          </span>
        </RouterLink>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-gray-900">Doctor Portal</h1>
        <span class="text-sm text-gray-500">{{ today }}</span>
      </header>
      <main class="flex-1 p-6 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import NavItem from '@/components/NavItem.vue'
import { 
  Activity, // Used as the core brand icon
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  UserRound, 
  FlaskConical, 
  ArrowLeft 
} from 'lucide-vue-next'

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
</script>