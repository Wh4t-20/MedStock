<template>
  <div class="h-screen overflow-hidden flex bg-gray-50 font-public-sans">

    <!-- Sidebar -->
    <aside
      class="group/sidebar
             h-screen
             w-20 hover:w-64
             bg-[#1A1F3A]
             text-white
             flex flex-col
             shrink-0
             transition-all duration-300 ease-in-out
             overflow-hidden z-10"
    >

      <!-- Branding -->
      <div class="px-5 pt-6 pb-5 border-b border-white/10 h-[88px] flex flex-col justify-center shrink-0">
        <RouterLink
          to="/"
          class="font-public-sans font-bold text-xl tracking-tight flex items-center gap-2 whitespace-nowrap"
        >
          <Activity class="w-6 h-6 text-[#F5A623] shrink-0" />

          <div
            class="flex flex-col opacity-0 group-hover/sidebar:opacity-100
                   transition-opacity duration-300 ease-in-out"
          >
            <div class="flex items-center gap-0.5">
              <span class="text-white">Med</span>
              <span class="text-[#F5A623]">Stock</span>
            </div>

            <p
              class="text-white/40 text-[10px]
                     font-mono uppercase tracking-widest
                     leading-none mt-1"
            >
              The Synergy Pulse
            </p>
          </div>
        </RouterLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1">
        <NavItem to="/doctor/dashboard"  :icon="LayoutDashboard" label="Dashboard" />
        <NavItem to="/doctor/requests"   :icon="ClipboardList" label="Lab Requests" />
        <NavItem to="/doctor/patients"   :icon="Users" label="Patients" />

      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-white/10 shrink-0 space-y-2">

        <div
          class="flex items-center gap-3 px-3 py-2
                 rounded-xl bg-white/5 min-w-[180px]"
        >
          

          <div
            class="flex-1 min-w-0 opacity-0
                   group-hover/sidebar:opacity-100
                   transition-opacity duration-300
                   whitespace-nowrap"
          >
          

          </div>
        </div>
      
        <RouterLink
          to="/"
          class="flex items-center gap-2
                 text-white/60 hover:text-white
                 text-sm transition-colors
                 px-3 py-2 rounded-lg
                 hover:bg-white/5 whitespace-nowrap"
        >
          <ArrowLeft class="w-4 h-4 shrink-0" />

          <span
            class="opacity-0 group-hover/sidebar:opacity-100
                   transition-opacity duration-300"
          >
            Back to Home
          </span>
        </RouterLink>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

      <!-- Header -->
      <header
        class="h-[72px]
               shrink-0
               bg-white border-b border-gray-200
               px-6 flex items-center justify-between"
      >
        <h1 class="text-lg font-semibold text-[#18265F]">
          Doctor's Portal
        </h1>

        <div class="flex items-center gap-3">
          <button
            class="flex items-center gap-2.5
                   p-1.5 pr-3"
          >
            <div
              class="w-8 h-8 rounded-full
                     bg-[#1A1F3A] text-[#F5A623]
                     flex items-center justify-center
                     text-xs font-bold font-mono"
            >
              LF
            </div>

            <div class="hidden sm:block">
              <p class="text-xs font-semibold text-gray-800">
                Dr. Luisa Fernandez
              </p>

              <p class="text-[10px] text-gray-400 font-medium">
                Physician
              </p>
            </div>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import NavItem from '@/components/NavItem.vue'

import {
  Activity,
  LayoutDashboard,
  ClipboardList,
  Users,
  FlaskConical,
  ArrowLeft
} from 'lucide-vue-next'
</script>