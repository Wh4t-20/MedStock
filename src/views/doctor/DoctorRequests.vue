<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Lab Requests</h2>
        <p class="text-gray-500 text-sm mt-0.5">Manage and create laboratory test requests</p>
      </div>
      <button @click="showCreate = true" class="btn-primary">+ New Request</button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
  <input
    v-model="search"
    placeholder="Search patient, doctor…"
    class="form-input max-w-xs"
  />

  <!-- Styled Select -->
  <div class="relative w-48">
    <select
      v-model="filterStatus"
      class="form-select appearance-none w-full bg-white pr-10 shadow-sm"
    >
      <option value="">All Statuses</option>
      <option value="pending">Pending</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>

    <!-- Dropdown Icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  </div>
</div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-head">ID</th>
              <th class="table-head">Patient</th>
              <th class="table-head">Doctor</th>
              <th class="table-head">Date</th>
              <th class="table-head">Tests</th>
              <th class="table-head">Notes</th>
              <th class="table-head">Status</th>
              <th class="table-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in filtered" :key="req.request_id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="table-cell font-mono text-primary-700 font-semibold">{{ req.request_id }}</td>
              <td class="table-cell">{{ req.patient.first_name }} {{ req.patient.last_name }}</td>
              <td class="table-cell">Dr. {{ req.doctor.first_name }} {{ req.doctor.last_name }}</td>
              <td class="table-cell">{{ formatDate(req.request_date) }}</td>
              <td class="table-cell">
                <div class="flex flex-wrap gap-1">
                  <span v-for="d in req.details" :key="d.detail_id"
                    class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {{ d.test_type.test_name }}
                  </span>
                </div>
              </td>
              <td class="table-cell max-w-[140px] truncate text-gray-500 text-xs">{{ req.notes || '—' }}</td>
              <td class="table-cell"><StatusBadge :status="req.status" /></td>
              <td class="table-cell">
                <div class="flex gap-2">
                  <button @click="openDetail(req)" class="text-xs text-primary-600 hover:text-primary-800 font-medium">View</button>
                  <button @click="openEdit(req)" class="text-xs text-amber-600 hover:text-amber-800 font-medium">Edit</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="8" class="table-cell text-center text-gray-400 py-8">No requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <Modal v-model="showCreate" title="New Lab Request">
      <form @submit.prevent="submitCreate" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Patient</label>
            <select v-model="form.patient_id" required class="form-select">
              <option value="" disabled>Select patient…</option>
              <option v-for="p in store.patients" :key="p.patient_id" :value="p.patient_id">
                {{ p.first_name }} {{ p.last_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="form-label">Doctor</label>
            <select v-model="form.doctor_id" required class="form-select">
              <option value="" disabled>Select doctor…</option>
              <option v-for="d in store.doctors" :key="d.doctor_id" :value="d.doctor_id">
                Dr. {{ d.first_name }} {{ d.last_name }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label class="form-label">Tests Requested</label>
          <div class="grid grid-cols-2 gap-2 mt-1">
            <label v-for="tt in store.testTypes" :key="tt.test_type_id"
              class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
              <input type="checkbox" :value="tt.test_type_id" v-model="form.selectedTests" class="accent-primary-600" />
              <span>{{ tt.test_name }}</span>
              <span class="text-xs text-gray-400 ml-auto">{{ tt.category }}</span>
            </label>
          </div>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <textarea v-model="form.notes" class="form-input h-20 resize-none" placeholder="Clinical notes…"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showCreate = false" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Create Request</button>
        </div>
      </form>
    </Modal>

    <!-- Detail Modal -->
    <Modal v-model="showDetail" :title="`Request ${selected?.request_id}`">
      <div v-if="selected" class="space-y-5">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="bg-gray-50 rounded-xl p-4 space-y-2">
            <p class="font-semibold text-gray-700">Patient</p>
            <p>{{ selected.patient.first_name }} {{ selected.patient.middle_name }} {{ selected.patient.last_name }}</p>
            <p class="text-gray-500">{{ selected.patient.email }}</p>
            <p class="text-gray-500">{{ selected.patient.contact_number }}</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 space-y-2">
            <p class="font-semibold text-gray-700">Requesting Doctor</p>
            <p>Dr. {{ selected.doctor.first_name }} {{ selected.doctor.last_name }}</p>
            <p class="text-gray-500">{{ selected.doctor.specialization }}</p>
            <p class="text-gray-500">{{ selected.doctor.email }}</p>
          </div>
        </div>
        <div>
          <p class="font-semibold text-gray-700 text-sm mb-2">Tests Ordered</p>
          <div class="space-y-2">
            <div v-for="d in selected.details" :key="d.detail_id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-xl text-sm">
              <div>
                <span class="font-medium">{{ d.test_type.test_name }}</span>
                <span class="ml-2 text-gray-400 text-xs">{{ d.test_type.category }}</span>
              </div>
              <div>
                <span v-if="selected.results.find(r => r.detail_id === d.detail_id)"
                  class="badge-completed">Result Available</span>
                <span v-else class="badge-pending">Pending</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="selected.results.length">
          <p class="font-semibold text-gray-700 text-sm mb-2">Test Results</p>
          <div class="space-y-2">
            <div v-for="r in selected.results" :key="r.result_id"
              class="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-green-800">
                  {{ selected.details.find(d => d.detail_id === r.detail_id)?.test_type.test_name }}
                </span>
                <span class="text-xs text-gray-500">{{ formatDate(r.result_date) }}</span>
              </div>
              <p class="text-gray-700">{{ r.result_value }}</p>
              <p v-if="r.remarks" class="text-gray-500 text-xs mt-1">{{ r.remarks }}</p>
              <p class="text-xs text-gray-400 mt-1">By: {{ r.technician.first_name }} {{ r.technician.last_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Edit Status Modal -->
    <Modal v-model="showEdit" title="Update Request Status">
      <form v-if="editReq" @submit.prevent="submitEdit" class="space-y-4">
        <div>
          <label class="form-label">Status</label>
          <select v-model="editReq.status" required class="form-select">
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <textarea v-model="editReq.notes" class="form-input h-20 resize-none"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showEdit = false" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useLabStore } from '@/stores/lab'
import type { LabRequestView, LabRequest } from '@/types'
import StatusBadge from '@/components/StatusBadge.vue'
import Modal       from '@/components/Modal.vue'

const store = useLabStore()
const search       = ref('')
const filterStatus = ref('')
const showCreate   = ref(false)
const showDetail   = ref(false)
const showEdit     = ref(false)
const selected     = ref<LabRequestView | null>(null)
const editReq      = ref<Partial<LabRequest> & { request_id: string } | null>(null)

const form = reactive({
  patient_id: '', doctor_id: '', notes: '', selectedTests: [] as string[]
})

const filtered = computed(() =>
  store.requestViews.filter(r => {
    const q = search.value.toLowerCase()
    const matchSearch = !q ||
      `${r.patient.first_name} ${r.patient.last_name}`.toLowerCase().includes(q) ||
      `${r.doctor.first_name} ${r.doctor.last_name}`.toLowerCase().includes(q) ||
      r.request_id.toLowerCase().includes(q)
    const matchStatus = !filterStatus.value || r.status === filterStatus.value
    return matchSearch && matchStatus
  }).reverse()
)

function openDetail(req: LabRequestView) { selected.value = req; showDetail.value = true }
function openEdit(req: LabRequestView)   {
  editReq.value = { request_id: req.request_id, status: req.status, notes: req.notes }
  showEdit.value = true
}

function submitCreate() {
  if (!form.selectedTests.length) return alert('Please select at least one test.')
  store.addLabRequest(
    { patient_id: form.patient_id, doctor_id: form.doctor_id, notes: form.notes,
      request_date: new Date().toISOString(), status: 'Pending' },
    form.selectedTests
  )
  Object.assign(form, { patient_id: '', doctor_id: '', notes: '', selectedTests: [] })
  showCreate.value = false
}

function submitEdit() {
  if (!editReq.value) return
  store.updateLabRequest(editReq.value.request_id, editReq.value)
  showEdit.value = false
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

