<template>
  <div class="min-h-screen flex bg-gray-50 font-public-sans">
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

      <nav class="flex-1 p-4 space-y-1">
        <NavItem to="/patient/dashboard" :icon="LayoutDashboard" label="Dashboard" />
        <NavItem to="/patient/requests"  :icon="ClipboardList" label="My Requests" />
        <NavItem to="/patient/directory" :icon="Users" label="My Profile" />
      </nav>

      <div class="p-4 border-t border-white/10 shrink-0 space-y-2">

        <div
          class="flex items-center gap-3 px-3 py-2
                 rounded-xl bg-white/5 min-w-[180px]"
        >
          <div
            class="w-8 h-8 rounded-full
                   bg-[#F5A623] text-[#1A1F3A]
                   flex items-center justify-center
                   text-xs font-bold font-mono shrink-0"
          >
            LF
          </div>

          <div
            class="flex-1 min-w-0 opacity-0
                   group-hover/sidebar:opacity-100
                   transition-opacity duration-300
                   whitespace-nowrap"
          >
            <p class="text-xs font-semibold text-white truncate">
              LUISA FERNANDEZ
            </p>

            <p class="text-[10px] text-white/40 truncate">
              dr.aquino@clinic.com
            </p>
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

    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

<!-- Header -->
<header
  class="h-[72px]
         shrink-0
         bg-white border-b border-gray-200
         px-6 flex items-center justify-between"
>
  <h1 class="text-lg font-semibold text-[#18265F]">
    Patient's Portal
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
        CT
      </div>

      <div class="hidden sm:block">
        <p class="text-xs font-semibold text-gray-800">
          Curly Topz
        </p>

        <p class="text-[10px] text-gray-400 font-medium">
          Patient
        </p>
      </div>
    </button>
  </div>
</header>

<!-- Scrollable Content -->
<main class="flex-1 overflow-y-auto p-6">
  <RouterView />
</main>

</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import NavItem from '@/components/NavItem.vue'
import { supabase } from '@/api/supabase'
import { ClipboardList } from 'lucide-vue-next'

import {
  LayoutDashboard,
  Users,
  ArrowLeft,
  Activity,
 
} from 'lucide-vue-next'
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
