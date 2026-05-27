<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Test Queue</h2>
      <p class="text-gray-500 text-sm mt-0.5">Process pending and in-progress lab requests</p>
    </div>

    <div class="space-y-4">
      <div v-for="req in queue" :key="req.request_id" class="card p-5">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono text-primary-700 font-bold text-sm">{{ req.request_id }}</span>
              <StatusBadge :status="req.status" />
            </div>
            <p class="font-semibold text-gray-900">{{ req.patient.first_name }} {{ req.patient.last_name }}</p>
            <p class="text-sm text-gray-500">Dr. {{ req.doctor.first_name }} {{ req.doctor.last_name }} · {{ formatDate(req.request_date) }}</p>
          </div>
          <div class="flex gap-2">
            <button v-if="req.status === 'Pending'" @click="markInProgress(req.request_id)" class="btn-accent text-xs">Start Processing</button>
            <button v-if="req.status === 'In Progress'" @click="markComplete(req.request_id)" class="btn-primary text-xs bg-green-600 hover:bg-green-700">Mark Complete</button>
          </div>
        </div>

        <!-- Tests with result entry -->
        <div class="space-y-3">
          <div v-for="detail in req.details" :key="detail.detail_id"
            class="p-4 rounded-xl border"
            :class="getResult(req, detail.detail_id) ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'">
            <div class="flex items-center justify-between mb-2">
              <div>
                <span class="font-semibold text-gray-800">{{ detail.test_type.test_name }}</span>
                <span class="ml-2 text-xs text-gray-400">{{ detail.test_type.category }}</span>
              </div>
              <span v-if="getResult(req, detail.detail_id)" class="badge-completed">Done</span>
              <button v-else @click="openResultForm(req, detail)" class="btn-primary text-xs py-1">Enter Result</button>
            </div>
            <p class="text-xs text-gray-500">Normal: {{ detail.test_type.normal_range }}</p>
            <div v-if="getResult(req, detail.detail_id) as any" class="mt-2 text-sm">
              <p class="text-gray-700 font-medium">{{ (getResult(req, detail.detail_id) as any).result_value }}</p>
              <p class="text-gray-500 text-xs">{{ (getResult(req, detail.detail_id) as any).remarks }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!queue.length" class="card p-16 text-center text-gray-400">
        <p class="text-4xl mb-3">🎉</p>
        <p class="font-medium">No active requests in queue!</p>
      </div>
    </div>

    <!-- Enter Result Modal -->
    <Modal v-model="showResultModal" title="Enter Test Result">
      <form @submit.prevent="submitResult" class="space-y-4">
        <div class="p-3 bg-primary-50 rounded-xl text-sm">
          <p class="font-semibold text-primary-800">{{ currentDetail?.test_type.test_name }}</p>
          <p class="text-primary-600 text-xs mt-1">Normal: {{ currentDetail?.test_type.normal_range }}</p>
        </div>
        <div>
          <label class="form-label">Assigned Technician</label>
          <select v-model="resultForm.technician_id" required class="form-select">
            <option value="" disabled>Select technician…</option>
            <option v-for="t in store.technicians" :key="t.technician_id" :value="t.technician_id">
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
          <textarea v-model="resultForm.remarks" class="form-input h-20 resize-none" placeholder="Clinical remarks or interpretation…"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showResultModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Result</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useLabStore } from '@/stores/lab'
import type { LabRequestView, RequestDetail, TestType } from '@/types'
import StatusBadge from '@/components/StatusBadge.vue'
import Modal       from '@/components/Modal.vue'

const store = useLabStore()
const showResultModal = ref(false)
const currentReq    = ref<LabRequestView | null>(null)
const currentDetail = ref<(RequestDetail & { test_type: TestType }) | null>(null)

const resultForm = reactive({ technician_id: '', result_value: '', remarks: '' })

const queue = computed(() =>
  store.requestViews.filter(r => r.status === 'Pending' || r.status === 'In Progress')
)

function getResult(req: LabRequestView, detailId: string) {
  return req.results.find(r => r.detail_id === detailId) ?? null
}

function markInProgress(id: string) { store.updateLabRequest(id, { status: 'In Progress' }) }
function markComplete(id: string)   { store.updateLabRequest(id, { status: 'Completed'   }) }

function openResultForm(req: LabRequestView, detail: RequestDetail & { test_type: TestType }) {
  currentReq.value    = req
  currentDetail.value = detail
  Object.assign(resultForm, { technician_id: '', result_value: '', remarks: '' })
  showResultModal.value = true
}

function submitResult() {
  if (!currentDetail.value) return
  store.addTestResult({
    detail_id:      currentDetail.value.detail_id,
    technician_id:  resultForm.technician_id,
    result_value:   resultForm.result_value,
    remarks:        resultForm.remarks,
    result_date:    new Date().toISOString()
  })
  showResultModal.value = false
}

function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
</script>
