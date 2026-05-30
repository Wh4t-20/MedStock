<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Lab Requests</h2>
        <p class="text-gray-500 text-sm mt-0.5">Manage and create laboratory test requests</p>
      </div>
      <button @click="openCreate" class="btn-primary">+ New Request</button>
    </div>

    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
      ⚠️ {{ errorMsg }}
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <input v-model="search" placeholder="Search patient…" class="form-input max-w-xs" />
      <select v-model="filterStatus" class="form-select w-44">
        <option value="">All Statuses</option>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
        <option>Cancelled</option>
      </select>
    </div>

    <!-- Table -->
    <div v-if="loading" class="card p-8 text-center text-gray-400">Loading requests...</div>
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-head">ID</th>
              <th class="table-head">Patient</th>
              <th class="table-head">Date</th>
              <th class="table-head">Tests Done</th>
              <th class="table-head">Notes</th>
              <th class="table-head">Status</th>
              <th class="table-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in filtered" :key="req.request_id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="table-cell font-mono text-primary-700 font-semibold">{{ req.request_id }}</td>
              <td class="table-cell">{{ req.Patient?.first_name }} {{ req.Patient?.last_name }}</td>
              <td class="table-cell">{{ formatDate(req.request_date) }}</td>
              <td class="table-cell">
                <div class="flex flex-wrap gap-1">
                  <span v-for="r in req.TestResult" :key="r.result_id"
                    class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {{ r.TestType?.test_name }}
                  </span>
                  <span v-if="!req.TestResult?.length" class="text-gray-400 text-xs">—</span>
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
            <tr v-if="!filtered.length">
              <td colspan="7" class="table-cell text-center text-gray-400 py-8">No requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <Modal v-model="showCreate" title="New Lab Request">
      <form @submit.prevent="submitCreate" class="space-y-4">
        <div>
          <label class="form-label">Patient</label>
          <select v-model="form.patient_id" required class="form-select">
            <option value="" disabled>Select patient…</option>
            <option v-for="p in patients" :key="p.patients_id" :value="p.patients_id">
              {{ p.first_name }} {{ p.last_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <textarea v-model="form.notes" class="form-input h-20 resize-none" placeholder="Clinical notes, tests needed…"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showCreate = false" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Creating…' : 'Create Request' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Detail Modal -->
    <Modal v-model="showDetail" :title="`Request ${selected?.request_id}`">
      <div v-if="selected" class="space-y-5">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="bg-gray-50 rounded-xl p-4 space-y-2">
            <p class="font-semibold text-gray-700">Patient</p>
            <p>{{ selected.Patient?.first_name }} {{ selected.Patient?.last_name }}</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 space-y-2">
            <p class="font-semibold text-gray-700">Doctor</p>
            <p>Dr. {{ selected.Doctor?.first_name }} {{ selected.Doctor?.last_name }}</p>
            <p class="text-gray-500 text-xs">{{ selected.Doctor?.specialization }}</p>
          </div>
        </div>
        <div v-if="selected.notes" class="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
          <p class="font-semibold text-gray-700 mb-1">Notes</p>
          <p>{{ selected.notes }}</p>
        </div>
        <div v-if="selected.TestResult?.length">
          <p class="font-semibold text-gray-700 text-sm mb-2">Test Results</p>
          <div class="space-y-2">
            <div v-for="r in selected.TestResult" :key="r.result_id"
              class="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-green-800">{{ r.TestType?.test_name }}</span>
                <span class="text-xs text-gray-500">{{ formatDate(r.result_date) }}</span>
              </div>
              <p class="text-gray-700">{{ r.result_value }}</p>
              <p v-if="r.remarks" class="text-gray-500 text-xs mt-1">{{ r.remarks }}</p>
              <p class="text-xs text-gray-400 mt-1">By: {{ r.LabTechnician?.first_name }} {{ r.LabTechnician?.last_name }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-amber-600 bg-amber-50 rounded-xl p-4">Awaiting results…</div>
      </div>
    </Modal>

    <!-- Edit Modal -->
    <Modal v-model="showEdit" title="Update Request">
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
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import { doctorListings } from '@/services/doctorListings'
import { patientListings } from '@/services/patientListings'
import StatusBadge from '@/components/StatusBadge.vue'
import Modal       from '@/components/Modal.vue'

const requests      = ref<any[]>([])
const patients      = ref<any[]>([])
const loading       = ref(true)
const saving        = ref(false)
const errorMsg      = ref('')
const search        = ref('')
const filterStatus  = ref('')
const showCreate    = ref(false)
const showDetail    = ref(false)
const showEdit      = ref(false)
const selected      = ref<any>(null)
const editReq       = ref<any>(null)
const currentDoctor = ref<any>(null)

const form = reactive({ patient_id: '' as any, notes: '' })

async function fetchRequests() {
  const { data, error } = await supabase
    .from('LabRequest')
    .select(`
      *,
      Patient(first_name, last_name),
      Doctor(first_name, last_name, specialization),
      TestResult(*, TestType(test_name, category), LabTechnician(first_name, last_name))
    `)
    .order('request_date', { ascending: false })

  if (error) { errorMsg.value = `Failed to load requests: ${error.message}`; return }
  requests.value = data ?? []
}

onMounted(async () => {
  try {
    const [doc, pats] = await Promise.all([
      doctorListings.getCurrentDoctorProfile(),
      patientListings.getAllPatients()
    ])
    currentDoctor.value = doc
    patients.value      = pats ?? []
    await fetchRequests()
  } catch (e: any) {
    errorMsg.value = e.message ?? 'Error loading data'
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return requests.value.filter(r => {
    const name = `${r.Patient?.first_name ?? ''} ${r.Patient?.last_name ?? ''}`.toLowerCase()
    const matchSearch = !q || name.includes(q) || String(r.request_id).includes(q)
    const matchStatus = !filterStatus.value || r.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

function openCreate() { Object.assign(form, { patient_id: '', notes: '' }); showCreate.value = true }
function openDetail(req: any) { selected.value = req; showDetail.value = true }
function openEdit(req: any) {
  editReq.value = { request_id: req.request_id, status: req.status, notes: req.notes }
  showEdit.value = true
}

async function submitCreate() {
  if (!form.patient_id)    { alert('Please select a patient.'); return }
  if (!currentDoctor.value) { alert('Doctor profile not loaded.'); return }
  saving.value = true
  const { error } = await supabase.from('LabRequest').insert({
    patient_id:   Number(form.patient_id),
    doctor_id:    currentDoctor.value.doctor_id,
    request_date: new Date().toISOString().split('T')[0],
    status:       'Pending',
    notes:        form.notes
  })
  if (error) { errorMsg.value = `Create failed: ${error.message}` }
  else { showCreate.value = false; await fetchRequests() }
  saving.value = false
}

async function submitEdit() {
  if (!editReq.value) return
  saving.value = true
  const { error } = await supabase
    .from('LabRequest')
    .update({ status: editReq.value.status, notes: editReq.value.notes })
    .eq('request_id', editReq.value.request_id)
  if (error) { errorMsg.value = `Update failed: ${error.message}` }
  else { showEdit.value = false; await fetchRequests() }
  saving.value = false
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
