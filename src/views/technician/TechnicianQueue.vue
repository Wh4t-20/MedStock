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
            <button
              v-if="req.status === 'Pending'"
              @click="markInProgress(req.request_id)"
              :disabled="updating === req.request_id"
              class="btn-accent text-xs disabled:opacity-50">
              {{ updating === req.request_id ? 'Updating…' : 'Start Processing' }}
            </button>
            <button
              v-if="req.status === 'In Progress'"
              @click="markComplete(req.request_id)"
              :disabled="updating === req.request_id"
              class="btn-primary text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50">
              {{ updating === req.request_id ? 'Updating…' : 'Mark Complete' }}
            </button>
          </div>
        </div>

        <!-- Existing results -->
        <div class="space-y-3">
          <div v-for="result in req.TestResult" :key="result.result_id"
            class="p-4 rounded-xl border border-green-200 bg-green-50">
            <div class="flex items-center justify-between mb-1">
              <div>
                <span class="font-semibold text-gray-800">{{ result.TestType?.test_name }}</span>
                <span class="ml-2 text-xs text-gray-400">{{ result.TestType?.category }}</span>
              </div>
              <span class="badge-completed">Done</span>
            </div>
            <p class="text-xs text-gray-500 mb-1">Normal: {{ result.TestType?.normal_range }}</p>
            <p class="text-sm font-medium text-gray-700">{{ result.result_value }}</p>
            <p v-if="result.remarks" class="text-xs text-gray-500 mt-0.5">{{ result.remarks }}</p>
          </div>

          <div v-if="!req.TestResult?.length" class="p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
            No results entered yet.
          </div>
        </div>

        <button @click="openResultForm(req)" class="btn-primary text-xs mt-3">+ Add Result</button>
      </div>

      <div v-if="!queue.length" class="card p-16 text-center text-gray-400">
        <p class="text-4xl mb-3">🎉</p>
        <p class="font-medium">No active requests in queue!</p>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="errorMsg" class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm z-50">
      ⚠️ {{ errorMsg }}
      <button @click="errorMsg = ''" class="ml-3 underline">Dismiss</button>
    </div>

    <!-- Enter Result Modal -->
    <Modal v-model="showResultModal" title="Enter Test Result">
      <form @submit.prevent="submitResult" class="space-y-4">
        <div>
          <label class="form-label">Test Type</label>
          <div v-if="!testTypes.length" class="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
            No test types found. Please add test types first.
          </div>
          <select v-else v-model="resultForm.test_type_id" required class="form-select">
            <option value="" disabled>Select test type…</option>
            <option v-for="tt in testTypes" :key="tt.test_type_id" :value="tt.test_type_id">
              {{ tt.test_name }} — {{ tt.category }}
            </option>
          </select>
        </div>
        <div>
          <label class="form-label">Assigned Technician</label>
          <select v-model="resultForm.technician_id" required class="form-select">
            <option value="" disabled>Select technician…</option>
            <option v-for="t in technicians" :key="t.technician_id" :value="t.technician_id">
              {{ t.first_name }} {{ t.last_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="form-label">Result Value</label>
          <textarea v-model="resultForm.result_value" required class="form-input h-24 resize-none" placeholder="Enter measured values…"></textarea>
        </div>
        <div>
          <label class="form-label">Remarks</label>
          <textarea v-model="resultForm.remarks" class="form-input h-20 resize-none" placeholder="Clinical remarks…"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showResultModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="submitting" class="btn-primary">
            {{ submitting ? 'Saving…' : 'Save Result' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import StatusBadge from '@/components/StatusBadge.vue'
import Modal       from '@/components/Modal.vue'

const queue       = ref<any[]>([])
const testTypes   = ref<any[]>([])
const technicians = ref<any[]>([])
const loading     = ref(true)
const submitting  = ref(false)
const updating    = ref<number | null>(null)
const errorMsg    = ref('')

const showResultModal = ref(false)
const currentReq      = ref<any>(null)
const resultForm      = reactive({
  test_type_id: '' as any, technician_id: '' as any, result_value: '', remarks: ''
})

async function fetchQueue() {
  const { data, error } = await supabase
    .from('LabRequest')
    .select(`
      *,
      Patient(first_name, last_name),
      Doctor(first_name, last_name),
      TestResult(*, TestType(test_name, category, normal_range))
    `)
    .in('status', ['Pending', 'In Progress'])
    .order('request_date', { ascending: true })

  if (error) { errorMsg.value = `Queue fetch failed: ${error.message}`; return }
  queue.value = data ?? []
}

onMounted(async () => {
  try {
    const [, ttRes, techRes] = await Promise.all([
      fetchQueue(),
      supabase.from('TestType').select('test_type_id, test_name, category, normal_range'),
      supabase.from('LabTechnician').select('technician_id, first_name, last_name')
    ])

    if (ttRes.error)   errorMsg.value = `TestType fetch failed: ${ttRes.error.message}`
    if (techRes.error) errorMsg.value = `Technician fetch failed: ${techRes.error.message}`

    testTypes.value   = ttRes.data   ?? []
    technicians.value = techRes.data ?? []
  } catch (e: any) {
    errorMsg.value = e.message ?? 'Unknown error on load'
  } finally {
    loading.value = false
  }
})

async function markInProgress(id: number) {
  updating.value = id
  const { error } = await supabase
    .from('LabRequest')
    .update({ status: 'In Progress' })
    .eq('request_id', id)

  if (error) { errorMsg.value = `Update failed: ${error.message}` }
  else { await fetchQueue() }
  updating.value = null
}

async function markComplete(id: number) {
  updating.value = id
  const { error } = await supabase
    .from('LabRequest')
    .update({ status: 'Completed' })
    .eq('request_id', id)

  if (error) { errorMsg.value = `Update failed: ${error.message}` }
  else { await fetchQueue() }
  updating.value = null
}

function openResultForm(req: any) {
  currentReq.value = req
  Object.assign(resultForm, { test_type_id: '', technician_id: '', result_value: '', remarks: '' })
  showResultModal.value = true
}

async function submitResult() {
  if (!currentReq.value) return
  submitting.value = true
  const { error } = await supabase.from('TestResult').insert({
    request_id:    currentReq.value.request_id,
    test_type_id:  Number(resultForm.test_type_id),
    technician_id: Number(resultForm.technician_id),
    result_value:  resultForm.result_value,
    remarks:       resultForm.remarks,
    result_date:   new Date().toISOString().split('T')[0]
  })

  if (error) { errorMsg.value = `Save failed: ${error.message}` }
  else { showResultModal.value = false; await fetchQueue() }
  submitting.value = false
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
