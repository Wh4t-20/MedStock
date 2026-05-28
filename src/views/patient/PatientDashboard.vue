<template>
  <div class="space-y-6">
    <div>
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
            <tr v-for="req in requests.slice(0, 5)" :key="req.request_id"
              class="border-b border-gray-50 hover:bg-blue-50 transition-colors">
              <td class="p-4 font-mono text-primary-700 font-medium text-sm">{{ req.request_id }}</td>
              <td class="p-4 text-gray-600 text-sm">{{ formatDate(req.request_date) }}</td>
              <td class="p-4 text-sm text-gray-700">
                {{ req.TestResult?.map((r: any) => r.TestType?.test_name).filter(Boolean).join(', ') || '—' }}
              </td>
              <td class="p-4"><StatusBadge :status="req.status" /></td>
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

const patient  = ref<any>(null)
const requests = ref<any[]>([])
const loading  = ref(true)

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
