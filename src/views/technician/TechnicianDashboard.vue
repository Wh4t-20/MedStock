<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Technician Dashboard</h2>
      <p class="text-gray-500 text-sm mt-1">Test processing overview</p>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="🔬" label="Lab Technicians"    :value="store.stats.totalTechnicians"   iconBg="bg-green-100" />
      <StatCard icon="📥" label="In Progress"         :value="store.stats.inProgressRequests" iconBg="bg-blue-100" />
      <StatCard icon="⏳" label="Pending"              :value="store.stats.pendingRequests"    iconBg="bg-amber-100" />
      <StatCard icon="✅" label="Completed"            :value="store.stats.completedRequests"  iconBg="bg-green-100" />
    </div>

    <!-- Pending/In-progress queue -->
    <div class="card overflow-hidden">
      <div class="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">Active Queue</h3>
        <RouterLink to="/technician/queue" class="text-sm text-primary-600 hover:text-primary-800 font-medium">Go to Queue →</RouterLink>
      </div>
      <div class="overflow-x-auto">
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
              <td class="table-cell">{{ req.patient.first_name }} {{ req.patient.last_name }}</td>
              <td class="table-cell">
                <div class="flex flex-wrap gap-1">
                  <span v-for="d in req.details" :key="d.detail_id" class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{{ d.test_type.test_name }}</span>
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
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLabStore } from '@/stores/lab'
import StatCard    from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const store      = useLabStore()
const activeQueue = computed(() =>
  store.requestViews.filter(r => r.status === 'Pending' || r.status === 'In Progress')
)
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
</script>
