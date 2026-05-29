<template>
  <div class="space-y-6">

    <!-- Header -->
    <div>
      <h2 class="text-2xl font-mono font-bold text-[#18265F]">
        Patient Overview
      </h2>

      <p class="text-gray-500 text-sm mt-1">
        Lab request summary of
        {{ currentPatient?.first_name || 'Loading...' }}
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-7">
      <StatCard
        icon="📋"
        label="Total Requests"
        :value="stats.total"
        iconBg="bg-blue-100"
      />

      <StatCard
        icon="⏳"
        label="Pending"
        :value="stats.pending"
        iconBg="bg-amber-100"
      />

      <StatCard
        icon="✅"
        label="Completed"
        :value="stats.completed"
        iconBg="bg-green-100"
      />
    </div>

    <!-- Profile Summary -->
    <div class="card overflow-hidden">
      <div class="p-5 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">My Profile Summary</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">

          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-head">Patient</th>
              <th class="table-head">Date of Birth</th>
              <th class="table-head">Contact</th>
              <th class="table-head">Requests</th>
              <th class="table-head">Latest Status</th>
            </tr>
          </thead>

          <tbody>

            <!-- Current Patient -->
            <tr
              v-if="currentPatient"
              class="border-b border-gray-50 hover:bg-gray-50"
            >
              <td class="p-4">
                <div class="flex items-center gap-3">

                  <div class="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-sm">
                    {{ currentPatient.first_name?.[0] }}
                    {{ currentPatient.last_name?.[0] }}
                  </div>

                  <div>
                    <p class="font-medium text-gray-900">
                      {{ currentPatient.first_name }}
                      {{ currentPatient.last_name }}
                    </p>

                    <p class="text-xs text-gray-400">
                      {{ currentPatient.patients_id }}
                    </p>
                  </div>

                </div>
              </td>
              <td class="table-cell text-gray-500">{{ currentPatient.birth_date }}</td>
              <td class="table-cell text-gray-500">{{ currentPatient.contact_number }}</td>
              <td class="table-cell">
                <!-- Ensure we pass patients_id to the function -->
                <span class="font-semibold text-primary-700">{{ requestCount(currentPatient.patients_id) }}</span>
              </td>
              <td class="table-cell">
                <StatusBadge v-if="latestStatus(currentPatient.patients_id)" :status="latestStatus(currentPatient.patients_id)!" />
                <span v-else class="text-gray-400 text-xs">—</span>
              </td>
            </tr>

            <!-- Loading Profile -->
            <tr v-if="isLoadingProfile">
              <td
                colspan="4"
                class="text-center py-6 text-gray-500"
              >
                Loading patient data...
              </td>
            </tr>

          </tbody>

        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useLabStore } from '@/stores/lab'
import StatCard     from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { patientListings } from '@/services/patientListings'
import { ref, onMounted, computed } from 'vue'
// Make sure to import supabase if you are using it
// import { supabase } from '@/lib/supabase' 

const store = useLabStore()
const currentPatient = ref<any>(null)
const isLoadingProfile = ref(true)

// Assuming your store has a 'requests' getter or state
const requests = computed(() => store.labRequests)

onMounted(async () => {
  try {
    currentPatient.value = await patientListings.getCurrentPatient()
    
    // If you need the user data:
    // const { data: { user } } = await supabase.auth.getUser()
    
    console.log("My Fetched Profile:", currentPatient.value)
  } 
  catch (error) {
    console.error("Could not load patient profile:", error)
  } finally {
    isLoadingProfile.value = false
  }
})

// Unified latestStatus function
function latestStatus(pid: string) {
  if (!pid) return null
  
  const reqs = requests.value.filter(
    r => r.patient_id === pid || r.patients_id === pid
  )

  if (!reqs.length) return null

  // If you want the most recent (assuming they are sorted by date)
  return reqs[reqs.length - 1].status
}

function requestCount(pid: string) {
  return requests.value.filter(r => r.patient_id === pid || r.patients_id === pid).length
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>