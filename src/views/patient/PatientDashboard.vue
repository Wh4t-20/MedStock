<template>
  <div class="space-y-6">

    <div>
      <h2 class="text-2xl font-mono font-bold text-[#18265F]">
        Patient Overview
      </h2>
      <p class="text-gray-500 text-sm mt-1">
        Lab request summary of
        {{ currentPatient?.first_name || 'Loading...' }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-7">
      <StatCard icon="📋" label="Total Requests" :value="stats.total"     iconBg="bg-blue-100" />
      <StatCard icon="⏳" label="Pending"        :value="stats.pending"   iconBg="bg-amber-100" />
      <StatCard icon="✅" label="Completed"      :value="stats.completed" iconBg="bg-green-100" />
    </div>

    <div class="card overflow-hidden border border-gray-100 shadow-sm rounded-xl bg-white">
      <div class="p-5 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">My Profile Summary</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
              <th class="p-4 font-semibold">Patient</th>
              <th class="p-4 font-semibold">Date of Birth</th>
              <th class="p-4 font-semibold">Contact</th>
              <th class="p-4 font-semibold">Requests</th>
              <th class="p-4 font-semibold">Latest Status</th>
            </tr>
          </thead>

          <tbody>
            
            <tr v-if="isLoadingProfile">
              <td colspan="5" class="text-center py-8 text-gray-500 font-medium">
                Loading patient data...
              </td>
            </tr>

            <tr v-else-if="currentPatient" class="border-b border-gray-50 hover:bg-blue-50 transition-colors">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {{ currentPatient.first_name?.[0] }}{{ currentPatient.last_name?.[0] }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">
                      {{ currentPatient.first_name }} {{ currentPatient.last_name }}
                    </p>
                    <p class="text-xs text-gray-500 font-mono">
                      #{{ currentPatient.patients_id }}
                    </p>
                  </div>
                </div>
              </td>
              
              <td class="p-4 text-gray-600">{{ currentPatient.birth_date }}</td>
              
              <td class="p-4 text-gray-600">
                <p>{{ currentPatient.contact_number || '—' }}</p>
                <p class="text-xs text-gray-400">{{ currentPatient.email || '' }}</p>
              </td>
              
              <td class="p-4">
                <span class="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                  {{ stats.total }}
                </span>
              </td>
              
              <td class="p-4">
                <StatusBadge v-if="latestStatus()" :status="latestStatus()!" />
                <span v-else class="text-gray-400 text-sm font-medium">—</span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import StatCard    from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { patientListings } from '@/services/patientListings'
import { supabase } from '@/api/supabase' // Make sure this path is correct!

const currentPatient = ref<any>(null)
const isLoadingProfile = ref(true)
const requests = ref<any[]>([]) // Now we store real Supabase requests here

// Dynamically calculate stats based on REAL database requests
const stats = computed(() => {
  return {
    total: requests.value.length,
    pending: requests.value.filter(r => r.status === 'Pending').length,
    completed: requests.value.filter(r => r.status === 'Completed').length
  }
})

onMounted(async () => {
  try {
    isLoadingProfile.value = true
    
    // 1. Fetch the real patient profile
    currentPatient.value = await patientListings.getCurrentPatient()
    
    // 2. Fetch all Lab Requests for this specific patient from Supabase
    if (currentPatient.value) {
      // Use the correct column name from your DB (patients_id or patient_id)
      const patientId = currentPatient.value.patients_id || currentPatient.value.patient_id
      
      const { data: labReqs, error } = await supabase
        .from('LabRequest')
        .select('*')
        .eq('patient_id', patientId) // Matches the patient
        .order('request_date', { ascending: false }) // Newest first

      if (!error && labReqs) {
        requests.value = labReqs
        console.log("Real Supabase Requests:", requests.value)
      }
    }
  } 
  catch (error) {
    console.error("Could not load patient profile:", error)
  } finally {
    isLoadingProfile.value = false
  }
})

// Gets the status of the most recent request
function latestStatus() {
  if (requests.value.length === 0) return null
  // Because we ordered by date descending in the query, the 0th item is the newest!
  return requests.value[0].status
}
</script>