<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-mono font-bold text-[#18265F]">Dashboard</h2>
      <p class="text-gray-500 text-sm mt-1">Overview of all laboratory activity</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="👥" label="Total Patients"    :value="store.stats.totalPatients"    iconBg="bg-blue-100" />
      <StatCard icon="📋" label="Total Requests"    :value="store.stats.totalRequests"    iconBg="bg-indigo-100" />
      <StatCard icon="⏳" label="Pending"            :value="store.stats.pendingRequests"  iconBg="bg-amber-100" />
      <StatCard icon="✅" label="Completed"          :value="store.stats.completedRequests" iconBg="bg-green-100" />
    </div>

    <!-- Recent requests -->
    <div class="card overflow-hidden">
      <div class="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 class="font-semibold font-inter text-[#18265F]">Recent Lab Requests</h3>
        <RouterLink to="/doctor/requests" class="text-sm text-primary-600 hover:text-primary-800 font-medium">View all →</RouterLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-head">Request ID</th>
              <th class="table-head">Patient</th>
              <th class="table-head">Date</th>
              <th class="table-head">Tests</th>
              <th class="table-head">Status</th>
              <th class="table-head">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in recent" :key="req.request_id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="table-cell font-mono text-primary-700 font-medium">{{ req.request_id }}</td>
              <td class="table-cell">{{ req.patient.first_name }} {{ req.patient.last_name }}</td>  
              <td class="table-cell">{{ formatDate(req.request_date) }}</td>
              <td class="table-cell">
                <div class="flex flex-wrap gap-1">
                  <span v-for="d in req.details" :key="d.detail_id"
                    class="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                    {{ d.test_type.test_name }}
                  </span>
                </div>
              </td>
              <td class="table-cell"><StatusBadge :status="req.status" /></td>
              <td class="table-cell">{{ req.notes || '—' }}</td>
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

const store  = useLabStore()
const recent = computed(() => store.requestViews.slice(-5).reverse())

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>