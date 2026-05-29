<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Technician Dashboard</h2>
      <p class="text-gray-500 text-sm mt-1">Test processing overview</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="🔬" label="Lab Technicians" :value="techCount"        iconBg="bg-green-100" />
      <StatCard icon="📥" label="In Progress"      :value="stats.inProgress" iconBg="bg-blue-100" />
      <StatCard icon="⏳" label="Pending"           :value="stats.pending"    iconBg="bg-amber-100" />
      <StatCard icon="✅" label="Completed"         :value="stats.completed"  iconBg="bg-green-100" />
    </div>

    <div class="card overflow-hidden">
      <div class="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">Active Queue</h3>
        <RouterLink to="/technician/queue" class="text-sm text-primary-600 hover:text-primary-800 font-medium">Go to Queue →</RouterLink>
      </div>
      <div v-if="loading" class="p-8 text-center text-gray-400">Loading...</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-head">Request ID</th>
              <th class="table-head">Patient</th>
              <th class="table-head">Tests</th>
              <th class="table-head">Date</th>
              <th class="table-head">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in activeQueue" :key="req.request_id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="table-cell font-mono text-primary-700 font-semibold">{{ req.request_id }}</td>
              <td class="table-cell">{{ req.Patient?.first_name }} {{ req.Patient?.last_name }}</td>
              <td class="table-cell">
                <div class="flex flex-wrap gap-1">
                  <span v-for="r in req.TestResult" :key="r.result_id"
                    class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {{ r.TestType?.test_name }}
                  </span>
                  <span v-if="!req.TestResult?.length" class="text-gray-400 text-xs italic">No results yet</span>
                </div>
              </td>
              <td class="table-cell text-gray-500">{{ formatDate(req.request_date) }}</td>
              <td class="table-cell"><StatusBadge :status="req.status" /></td>
            </tr>
            <tr v-if="!activeQueue.length">
              <td colspan="5" class="table-cell text-center text-gray-400 py-8">Queue is clear ✅</td>
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

const requests  = ref<any[]>([])
const techCount = ref(0)
const loading   = ref(true)

onMounted(async () => {
  try {
    const [{ data: reqs }, { count }] = await Promise.all([
      supabase
        .from('LabRequest')
        .select('*, Patient(first_name, last_name), TestResult(result_id, TestType(test_name))')
        .order('request_date', { ascending: false }),
      supabase.from('LabTechnician').select('*', { count: 'exact', head: true })
    ])
    requests.value  = reqs ?? []
    techCount.value = count ?? 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const activeQueue = computed(() =>
  requests.value.filter(r => r.status === 'Pending' || r.status === 'In Progress')
)

const stats = computed(() => ({
  pending:    requests.value.filter(r => r.status === 'Pending').length,
  inProgress: requests.value.filter(r => r.status === 'In Progress').length,
  completed:  requests.value.filter(r => r.status === 'Completed').length,
}))

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
