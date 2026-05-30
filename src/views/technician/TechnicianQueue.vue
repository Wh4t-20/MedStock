<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-2xl font-mono font-bold text-[#18265F]">Test Queue</h2>
      <p class="text-gray-500 text-sm mt-0.5">Process pending and in-progress lab requests</p>
    </div>

    <div v-if="loading" class="card p-12 text-center text-gray-400">Loading queue...</div>

    <div v-else class="space-y-4">
      <div v-for="req in queue" :key="req.request_id" class="card p-5">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono text-primary-700 font-bold text-sm">{{ req.request_id }}</span>
              <StatusBadge :status="req.status" />
            </div>
            <p class="font-semibold text-gray-900">{{ req.Patient?.first_name }} {{ req.Patient?.last_name }}</p>
            <p class="text-sm text-gray-500">Dr. {{ req.Doctor?.first_name }} {{ req.Doctor?.last_name }} · {{ formatDate(req.request_date) }}</p>
          </div>
          <div class="flex gap-2">
            <button v-if="req.status === 'Pending'"     @click="markInProgress(req.request_id)" class="btn-accent text-xs">Start Processing</button>
            <button v-if="req.status === 'In Progress'" @click="markComplete(req.request_id)"   class="btn-primary text-xs bg-green-600 hover:bg-green-700">Mark Complete</button>
          </div>
        </div>

        <div class="space-y-3">
          <div v-for="result in req.TestResult" :key="result.result_id"
            class="p-4 rounded-xl border border-gray-200"
            :class="result.result_value ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'">
            <div class="flex items-center justify-between mb-1">
              <div>
                <span class="font-semibold text-gray-800">{{ result.TestType?.test_name }}</span>
                <span class="ml-2 text-xs text-gray-400">{{ result.TestType?.category }}</span>
              </div>
              <span v-if="result.result_value" class="badge-completed text-green-600 text-xs font-bold">Done</span>
              <span v-else class="text-amber-500 text-xs font-bold">Pending Result</span>
            </div>
            <p class="text-xs text-gray-500 mb-1">Normal: {{ result.TestType?.normal_range }}</p>
            <p v-if="result.result_value" class="text-sm font-medium text-gray-700">{{ result.result_value }}</p>
            <p v-if="result.remark" class="text-xs text-gray-500 mt-0.5">{{ result.remark }}</p>
          </div>
        </div>

        <button @click="openResultForm(req)" class="btn-primary text-xs mt-3">+ Add Result</button>
      </div>

      <div v-if="!queue.length" class="card p-16 text-center text-gray-400">
        <p class="text-4xl mb-3">🎉</p>
        <p class="font-medium">No active requests in queue!</p>
      </div>
    </div>

    <Modal v-model="showResultModal" title="Enter Test Result">
      <form @submit.prevent="submitResult" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Test Type</label>
          <select v-model="resultForm.test_type_id" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="" disabled>Select test type…</option>
            <option v-for="tr in pendingTests" :key="tr.test_type_id" :value="tr.test_type_id">
              {{ tr.TestType?.test_name }} — {{ tr.TestType?.category }}
            </option>
          </select>
          <p v-if="pendingTests.length === 0" class="text-xs text-amber-600 mt-1">All tests for this request already have results.</p>
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Assigned Technician</label>
          <select v-model="resultForm.technician_id" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="" disabled>Select technician…</option>
            <option v-for="t in technicians" :key="t.technician_id" :value="t.technician_id">
              {{ t.first_name }} {{ t.last_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Result Value</label>
          <textarea v-model="resultForm.result_value" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none" placeholder="Enter measured values…"></textarea>
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Remarks</label>
          <textarea v-model="resultForm.remark" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none" placeholder="Clinical remarks or interpretation…"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
          <button type="button" @click="showResultModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
          <button type="submit" :disabled="submitting || pendingTests.length === 0" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors">
            {{ submitting ? 'Saving…' : 'Save Result' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import StatusBadge from '@/components/StatusBadge.vue'
import Modal       from '@/components/Modal.vue'

const queue       = ref<any[]>([])
const technicians = ref<any[]>([])
const loading     = ref(true)
const submitting  = ref(false)

const showResultModal = ref(false)
const currentReq      = ref<any>(null)
const resultForm      = reactive({
  test_type_id: '', technician_id: '', result_value: '', remark: ''
})

// Computed property to only show tests that belong to the current request AND don't have a result yet
const pendingTests = computed(() => {
  if (!currentReq.value || !currentReq.value.TestResult) return []
  return currentReq.value.TestResult.filter((tr: any) => !tr.result_value)
})

async function fetchQueue() {
  const { data } = await supabase
    .from('LabRequest')
    .select(`
      *,
      Patient(first_name, last_name),
      Doctor(first_name, last_name),
      TestResult(*, TestType(test_name, category, normal_range))
    `)
    .in('status', ['Pending', 'In Progress'])
    .order('request_date', { ascending: true })
  queue.value = data ?? []
}

onMounted(async () => {
  try {
    const [, { data: techs }] = await Promise.all([
      fetchQueue(),
      supabase.from('LabTechnician').select('technician_id, first_name, last_name')
    ])
    technicians.value = techs ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function markInProgress(id: number) {
  await supabase.from('LabRequest').update({ status: 'In Progress' }).eq('request_id', id)
  await fetchQueue()
}

async function markComplete(id: number) {
  await supabase.from('LabRequest').update({ status: 'Completed' }).eq('request_id', id)
  await fetchQueue()
}

function openResultForm(req: any) {
  currentReq.value = req
  Object.assign(resultForm, { test_type_id: '', technician_id: '', result_value: '', remark: '' })
  showResultModal.value = true
}

async function submitResult() {
  if (!currentReq.value) return
  submitting.value = true
  
  try {
    // UPDATE the existing row instead of inserting a new one!
    const { error } = await supabase
      .from('TestResult')
      .update({
        technician_id: resultForm.technician_id,
        result_value: resultForm.result_value,
        remark: resultForm.remark, // <--- I FIXED THE SPELLING HERE!
        result_date: new Date().toISOString().split('T')[0]
      })
      .eq('request_id', currentReq.value.request_id)
      .eq('test_type_id', resultForm.test_type_id) // Match the specific test they selected
      
    if (error) throw error
    
    showResultModal.value = false
    await fetchQueue() // Refresh the queue to show the new result
  } catch (e) {
    console.error("Error saving result:", e)
    alert("Failed to save result. Check console.")
  } finally {
    submitting.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>