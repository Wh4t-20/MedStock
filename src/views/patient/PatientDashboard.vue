<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Patient Overview</h2>
      <!-- 1. Updated to use currentPatient -->
      <p class="text-gray-500 text-sm mt-1">Lab request summary of {{ currentPatient?.first_name || 'Loading...' }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-7">
      <StatCard icon="📋" label="Total Requests"   :value="store.stats.totalRequests"       iconBg="bg-blue-100" />
      <StatCard icon="⏳" label="Pending"           :value="store.stats.pendingRequests"     iconBg="bg-amber-100" />
      <StatCard icon="✅" label="Completed"         :value="store.stats.completedRequests"   iconBg="bg-green-100" />
    </div>

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
            <!-- 2. Removed v-for loop, replaced with v-if checking for currentPatient -->
            <tr v-if="currentPatient" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="table-cell">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-sm">
                    {{ currentPatient.first_name?.[0] }}{{ currentPatient.last_name?.[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ currentPatient.first_name }} {{ currentPatient.last_name }}</p>
                    <p class="text-xs text-gray-400">{{ currentPatient.patients_id }}</p>
                  </div>
                </div>
              </td>
              <td class="table-cell text-gray-500">{{ currentPatient.date_of_birth }}</td>
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
            
            <!-- Added a loading state for the table -->
            <tr v-else-if="isLoadingProfile">
              <td colspan="5" class="text-center py-6 text-gray-500">Loading patient data...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLabStore } from '@/stores/lab'
import StatCard    from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { patientListings } from '@/services/patientListings'
import { computed, ref, onMounted } from 'vue'

const store = useLabStore()

const currentPatient = ref<any>(null)
const isLoadingProfile = ref(true)

onMounted(async () => {
  try {
    // 3. Just fetch the current patient, no need to fetch by doctor_id
    currentPatient.value = await patientListings.getCurrentPatient()
    console.log("My Fetched Profile:", currentPatient.value)
  } 
  catch (error) {
    console.error("Could not load patient profile:", error)
  } finally {
    isLoadingProfile.value = false
  }
})

// Note: Ensure your store.labRequests uses 'patients_id' or 'patient_id' consistently!
function requestCount(pid: string) {
  if (!pid) return 0
  return store.labRequests.filter(r => r.patients_id === pid || r.patient_id === pid).length
}

function latestStatus(pid: string) {
  if (!pid) return null
  const reqs = store.labRequests.filter(r => r.patients_id === pid || r.patient_id === pid)
  if (!reqs.length) return null
  return reqs[reqs.length - 1].status
}
</script>