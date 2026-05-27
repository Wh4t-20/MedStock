<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Patient Overview</h2>
      <p class="text-gray-500 text-sm mt-1">Lab request summary across all patients</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="👥" label="Total Patients"   :value="store.stats.totalPatients"      iconBg="bg-yellow-100" />
      <StatCard icon="📋" label="Total Requests"   :value="store.stats.totalRequests"       iconBg="bg-blue-100" />
      <StatCard icon="⏳" label="Pending"           :value="store.stats.pendingRequests"     iconBg="bg-amber-100" />
      <StatCard icon="✅" label="Completed"         :value="store.stats.completedRequests"   iconBg="bg-green-100" />
    </div>

    <!-- Patient list with request counts -->
    <div class="card overflow-hidden">
      <div class="p-5 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">Patient Summary</h3>
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
            <tr v-for="p in store.patients" :key="p.patient_id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="table-cell">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-sm">
                    {{ p.first_name[0] }}{{ p.last_name[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ p.first_name }} {{ p.last_name }}</p>
                    <p class="text-xs text-gray-400">{{ p.patient_id }}</p>
                  </div>
                </div>
              </td>
              <td class="table-cell text-gray-500">{{ p.date_of_birth }}</td>
              <td class="table-cell text-gray-500">{{ p.contact_number }}</td>
              <td class="table-cell">
                <span class="font-semibold text-primary-700">{{ requestCount(p.patient_id) }}</span>
              </td>
              <td class="table-cell">
                <StatusBadge v-if="latestStatus(p.patient_id)" :status="latestStatus(p.patient_id)!" />
                <span v-else class="text-gray-400 text-xs">—</span>
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
import StatCard    from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const store = useLabStore()

function requestCount(pid: string) {
  return store.labRequests.filter(r => r.patient_id === pid).length
}
function latestStatus(pid: string) {
  const reqs = store.labRequests.filter(r => r.patient_id === pid)
  if (!reqs.length) return null
  return reqs[reqs.length - 1].status
}
</script>
