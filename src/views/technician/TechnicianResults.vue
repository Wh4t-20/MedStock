<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-2xl font-mono font-bold text-[#18265F]">All Test Results</h2>
      <p class="text-gray-500 text-sm mt-0.5">Recorded test results across all patients</p>
    </div>

    <div class="flex flex-wrap gap-3">
      <select v-model="filterTech" class="form-select w-52">
        <option value="">All Technicians</option>
        <option v-for="t in store.technicians" :key="t.technician_id" :value="t.technician_id">
          {{ t.first_name }} {{ t.last_name }}
        </option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-head">Result ID</th>
              <th class="table-head">Patient</th>
              <th class="table-head">Test</th>
              <th class="table-head">Result Value</th>
              <th class="table-head">Remarks</th>
              <th class="table-head">Technician</th>
              <th class="table-head">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.result_id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="table-cell font-mono text-green-700 font-semibold text-xs">{{ row.result_id }}</td>
              <td class="table-cell">{{ row.patientName }}</td>
              <td class="table-cell"><span class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{{ row.testName }}</span></td>
              <td class="table-cell font-medium text-gray-800 max-w-[200px]">{{ row.result_value }}</td>
              <td class="table-cell text-gray-500 text-xs max-w-[160px]">{{ row.remarks || '—' }}</td>
              <td class="table-cell text-sm">{{ row.techName }}</td>
              <td class="table-cell text-gray-500">{{ formatDate(row.result_date) }}</td>
            </tr>
            <tr v-if="!rows.length"><td colspan="7" class="table-cell text-center text-gray-400 py-8">No results yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLabStore } from '@/stores/lab'

const store      = useLabStore()
const filterTech = ref('')

const rows = computed(() =>
  store.testResults
    .filter(r => !filterTech.value || r.technician_id === filterTech.value)
    .map(r => {
      const detail  = store.requestDetails.find(d => d.detail_id === r.detail_id)!
      const request = store.labRequests.find(req => req.request_id === detail?.request_id)!
      const patient = store.patients.find(p => p.patient_id === request?.patient_id)!
      const tt      = store.testTypes.find(t => t.test_type_id === detail?.test_type_id)!
      const tech    = store.technicians.find(t => t.technician_id === r.technician_id)!
      return {
        ...r,
        patientName: patient ? `${patient.first_name} ${patient.last_name}` : '—',
        testName:    tt?.test_name ?? '—',
        techName:    tech ? `${tech.first_name} ${tech.last_name}` : '—',
      }
    })
    .reverse()
)

function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
</script>
