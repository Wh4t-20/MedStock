<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">All Test Results</h2>
      <p class="text-gray-500 text-sm mt-0.5">Recorded test results across all patients</p>
    </div>

    <div class="flex flex-wrap gap-3">
      <select v-model="filterTech" class="form-select w-52">
        <option value="">All Technicians</option>
        <option v-for="t in technicians" :key="t.technician_id" :value="t.technician_id">
          {{ t.first_name }} {{ t.last_name }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="card p-8 text-center text-gray-400">Loading results...</div>

    <div v-else class="card overflow-hidden">
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
            <tr v-for="r in rows" :key="r.result_id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="table-cell font-mono text-green-700 font-semibold text-xs">{{ r.result_id }}</td>
              <td class="table-cell">{{ r.LabRequest?.Patient?.first_name }} {{ r.LabRequest?.Patient?.last_name }}</td>
              <td class="table-cell">
                <span class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{{ r.TestType?.test_name }}</span>
              </td>
              <td class="table-cell font-medium text-gray-800 max-w-[200px]">{{ r.result_value }}</td>
              <td class="table-cell text-gray-500 text-xs max-w-[160px]">{{ r.remarks || '—' }}</td>
              <td class="table-cell text-sm">{{ r.LabTechnician?.first_name }} {{ r.LabTechnician?.last_name }}</td>
              <td class="table-cell text-gray-500">{{ formatDate(r.result_date) }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="7" class="table-cell text-center text-gray-400 py-8">No results yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/api/supabase'

const allResults  = ref<any[]>([])
const technicians = ref<any[]>([])
const filterTech  = ref('')
const loading     = ref(true)

onMounted(async () => {
  try {
    const [{ data: results }, { data: techs }] = await Promise.all([
      supabase
        .from('TestResult')
        .select(`
          *,
          TestType(test_name, category),
          LabTechnician(first_name, last_name),
          LabRequest(request_id, Patient(first_name, last_name))
        `)
        .order('result_date', { ascending: false }),
      supabase.from('LabTechnician').select('technician_id, first_name, last_name')
    ])
    allResults.value  = results ?? []
    technicians.value = techs   ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const rows = computed(() =>
  allResults.value.filter(r => !filterTech.value || r.technician_id === filterTech.value)
)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
