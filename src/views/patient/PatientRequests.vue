<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">My Lab Requests</h2>
      <p class="text-gray-500 text-sm mt-0.5">Your lab test history and results</p>
    </div>

    <div class="flex flex-wrap gap-3">
      <select v-model="filterStatus" class="form-select w-40">
        <option value="">All Statuses</option>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
        <option>Cancelled</option>
      </select>
    </div>

    <div v-if="loading" class="card p-12 text-center text-gray-400">Loading your requests...</div>

    <div v-else-if="!filtered.length" class="card p-12 text-center text-gray-400">No lab requests found.</div>

    <div v-else class="space-y-4">
      <div v-for="req in filtered" :key="req.request_id" class="card p-5">

        <!-- Request header -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="font-mono text-primary-700 font-bold text-sm">{{ req.request_id }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ formatDate(req.request_date) }} · Dr. {{ req.Doctor?.last_name ?? '—' }}
            </p>
          </div>
          <StatusBadge :status="req.status" />
        </div>

        <!-- Test results -->
        <div v-if="req.TestResult?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="result in req.TestResult" :key="result.result_id"
            class="p-3 rounded-xl border border-green-200 bg-green-50">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-800">{{ result.TestType?.test_name }}</span>
              <span class="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">{{ result.TestType?.category }}</span>
            </div>
            <p class="text-sm font-medium text-gray-700">{{ result.result_value }}</p>
            <p v-if="result.remarks" class="text-xs text-gray-500 mt-1">{{ result.remarks }}</p>
            <p class="text-xs text-primary-600 mt-1">
              By {{ result.LabTechnician?.first_name }} {{ result.LabTechnician?.last_name }}
            </p>
            <p class="text-xs text-gray-400 mt-1">{{ formatDate(result.result_date) }}</p>
          </div>
        </div>

        <!-- No results yet -->
        <div v-else class="p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-amber-600">
          Awaiting results…
        </div>

        <div v-if="req.notes" class="mt-3 text-xs text-gray-500 italic">📝 {{ req.notes }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import StatusBadge from '@/components/StatusBadge.vue'
import { patientListings } from '@/services/patientListings' // Brought your service in!

const requests     = ref<any[]>([])
const filterStatus = ref('')
const loading      = ref(true)

onMounted(async () => {
  try {
    loading.value = true

    // 1. Let your service handle finding who the logged-in patient is
    const patient = await patientListings.getCurrentPatient()
    
    if (!patient) return

    // Account for your database column name (using the 's')
    const pid = patient.patients_id || patient.patient_id

    // 2. Fetch all their requests, joined with Doctor and Test Results
    const { data, error } = await supabase
      .from('LabRequest')
      .select(`
        *,
        Doctor(first_name, last_name),
        TestResult(
          *,
          TestType(test_name, category, normal_range),
          LabTechnician(first_name, last_name)
        )
      `)
      .eq('patient_id', pid)
      .order('request_date', { ascending: false })

    if (error) {
      console.error("Supabase relation error:", error)
      throw error
    }
    
    requests.value = data ?? []
    
  } catch (e) {
    console.error("Could not load requests:", e)
  } finally {
    loading.value = false
  }
})

// Filter logic for your dropdown menu
const filtered = computed(() =>
  requests.value.filter(r => !filterStatus.value || r.status === filterStatus.value)
)

// Date formatter
function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>