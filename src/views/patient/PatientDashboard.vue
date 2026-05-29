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
      <span v-if="loading" class="text-gray-500 font-medium">Loading...</span>
      <span v-else-if="patient" class="font-bold text-lg text-primary-700">
        Welcome, {{ patient.first_name }} {{ patient.last_name }}
      </span>
      <h2 class="text-2xl font-bold text-gray-900 mt-2">Dashboard</h2>
      <p class="text-gray-500 text-sm mt-1">Your lab request overview</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard icon="📋" label="Total Requests"  :value="stats.total"     iconBg="bg-blue-100" />
      <StatCard icon="⏳" label="Pending"          :value="stats.pending"   iconBg="bg-amber-100" />
      <StatCard icon="✅" label="Completed"        :value="stats.completed" iconBg="bg-green-100" />
    </div>

    <!-- Patient info card -->
    <div v-if="patient" class="card p-5">
      <h3 class="font-semibold text-gray-900 mb-4">My Information</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-gray-400 text-xs mb-1">Full Name</p>
          <p class="font-medium text-gray-800">{{ patient.first_name }} {{ patient.middle_name }} {{ patient.last_name }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-1">Date of Birth</p>
          <p class="font-medium text-gray-800">{{ patient.date_of_birth }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-1">Sex</p>
          <p class="font-medium text-gray-800">{{ patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-1">Email</p>
          <p class="font-medium text-gray-800">{{ patient.email }}</p>
        </div>
        <div v-if="patient.height && patient.weight">
          <p class="text-gray-400 text-xs mb-1">BMI</p>
          <p class="font-medium text-gray-800">{{ bmi(patient.weight, patient.height) }}</p>
        </div>
      </div>
    </div>

    <!-- Recent requests -->
    <div class="card overflow-hidden">
      <div class="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">Recent Requests</h3>
        <RouterLink to="/patient/requests" class="text-sm text-primary-600 hover:text-primary-800 font-medium">View all →</RouterLink>
      </div>
      <div v-if="loading" class="p-8 text-center text-gray-400">Loading...</div>
      <div v-else-if="!requests.length" class="p-8 text-center text-gray-400">No requests yet.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
              <th class="p-4 font-semibold text-left">Request ID</th>
              <th class="p-4 font-semibold text-left">Date</th>
              <th class="p-4 font-semibold text-left">Tests</th>
              <th class="p-4 font-semibold text-left">Status</th>
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
              <td class="table-cell text-gray-500">{{ currentPatient.birth_date }}</td>
              <td class="table-cell text-gray-500">{{ currentPatient.contact_number }}</td>
              <td class="table-cell">
                <!-- Ensure we pass patients_id to the function -->
                <span class="font-semibold text-primary-700">{{ requestCount(currentPatient.patients_id) }}</span>
              </td>
              <td class="table-cell">
                <StatusBadge v-if="latestStatus(currentPatient.patients_id)" :status="latestStatus(currentPatient.patients_id)!" />
                <span v-else class="text-gray-400 text-xs">—</span>
            <tr v-for="req in requests.slice(0, 5)" :key="req.request_id"
              class="border-b border-gray-50 hover:bg-blue-50 transition-colors">
              <td class="p-4 font-mono text-primary-700 font-medium text-sm">{{ req.request_id }}</td>
              <td class="p-4 text-gray-600 text-sm">{{ formatDate(req.request_date) }}</td>
              <td class="p-4 text-sm text-gray-700">
                {{ req.TestResult?.map((r: any) => r.TestType?.test_name).filter(Boolean).join(', ') || '—' }}
              </td>
              <td class="p-4"><StatusBadge :status="req.status" /></td>
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
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/api/supabase'
import StatCard    from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { patientListings } from '@/services/patientListings'
import { computed, ref, onMounted } from 'vue'

const patient  = ref<any>(null)
const requests = ref<any[]>([])
const loading  = ref(true)

const currentPatient = ref<any>(null)
const isLoadingProfile = ref(true)

onMounted(async () => {
  try {
    isLoadingProfile.value = true
    
    // 1. Check if the profile is already saved in the browser's temporary memory
    const cachedProfile = sessionStorage.getItem('patientProfile')
    
    if (cachedProfile) {
      // 2. If yes, load it instantly from memory. NO database fetch!
      currentPatient.value = JSON.parse(cachedProfile)
      console.log("Loaded from Cache! (No database hit):", currentPatient.value)
    } else {
      // 3. If no, fetch it from Supabase...
      const fetchedPatient = await patientListings.getCurrentPatient()
      currentPatient.value = fetchedPatient
      
      // ...and save it to memory so it doesn't fetch again when you switch tabs!
      sessionStorage.setItem('patientProfile', JSON.stringify(fetchedPatient))
      console.log("My Fetched Profile (From Database):", currentPatient.value)
    }
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
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: p } = await supabase
      .from('Patient')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!p) return
    patient.value = p

    const { data: reqs } = await supabase
      .from('LabRequest')
      .select('*, TestResult(*, TestType(test_name))')
      .eq('patient_id', p.patient_id)
      .order('request_date', { ascending: false })

    requests.value = reqs ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const stats = computed(() => ({
  total:     requests.value.length,
  pending:   requests.value.filter(r => r.status === 'Pending').length,
  completed: requests.value.filter(r => r.status === 'Completed').length,
}))

function bmi(w: number, h: number) { return (w / ((h / 100) ** 2)).toFixed(1) }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>