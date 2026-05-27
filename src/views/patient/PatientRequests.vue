<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div><h2 class="text-2xl font-bold text-gray-900">Lab Requests</h2><p class="text-gray-500 text-sm mt-0.5">View all lab requests and their results</p></div>
    </div>

    <!-- Patient filter -->
    <div class="flex flex-wrap gap-3">
      <select v-model="filterPatient" class="form-select w-56">
        <option value="">All Patients</option>
        <option v-for="p in store.patients" :key="p.patient_id" :value="p.patient_id">
          {{ p.first_name }} {{ p.last_name }}
        </option>
      </select>
      <select v-model="filterStatus" class="form-select w-40">
        <option value="">All Statuses</option>
        <option>Pending</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
      </select>
    </div>

    <div class="space-y-4">
      <div v-for="req in filtered" :key="req.request_id" class="card p-5">
        <!-- Request header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {{ req.patient.first_name[0] }}{{ req.patient.last_name[0] }}
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ req.patient.first_name }} {{ req.patient.last_name }}</p>
              <p class="text-xs text-gray-400">{{ req.request_id }} · {{ formatDate(req.request_date) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Dr. {{ req.doctor.last_name }}</span>
            <StatusBadge :status="req.status" />
          </div>
        </div>

        <!-- Tests & results -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="detail in req.details" :key="detail.detail_id"
            class="p-3 rounded-xl border"
            :class="getResult(req, detail.detail_id) ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-800">{{ detail.test_type.test_name }}</span>
              <span class="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">{{ detail.test_type.category }}</span>
            </div>
            <div v-if="getResult(req, detail.detail_id) as any" class="text-sm">
              <p class="font-medium text-gray-700">{{ (getResult(req, detail.detail_id) as any).result_value }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ (getResult(req, detail.detail_id) as any).remarks }}</p>
              <p class="text-xs text-primary-600 mt-1">By {{ (getResult(req, detail.detail_id) as any).technician.first_name }} {{ (getResult(req, detail.detail_id) as any).technician.last_name }}</p>
            </div>
            <div v-else>
              <p class="text-xs text-amber-600">Awaiting result…</p>
              <p class="text-xs text-gray-400 mt-1">Normal: {{ detail.test_type.normal_range }}</p>
            </div>
          </div>
        </div>

        <div v-if="req.notes" class="mt-3 text-xs text-gray-500 italic">📝 {{ req.notes }}</div>
      </div>

      <div v-if="filtered.length === 0" class="card p-12 text-center text-gray-400">
        No lab requests found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLabStore } from '@/stores/lab'
import type { LabRequestView } from '@/types'
import StatusBadge from '@/components/StatusBadge.vue'

const store = useLabStore()
const filterPatient = ref('')
const filterStatus  = ref('')

const filtered = computed(() =>
  store.requestViews.filter(r => {
    const matchP = !filterPatient.value || r.patient_id === filterPatient.value
    const matchS = !filterStatus.value  || r.status === filterStatus.value
    return matchP && matchS
  }).reverse()
)

function getResult(req: LabRequestView, detailId: string) {
  return req.results.find(r => r.detail_id === detailId) ?? null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
