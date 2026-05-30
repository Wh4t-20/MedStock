<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Lab Requests</h2>
        <p class="text-gray-500 text-sm mt-0.5">Manage and create laboratory test requests</p>
      </div>
      <button @click="showCreate = true" class="btn-primary">+ New Request</button>
    </div>

    <div class="flex flex-wrap gap-3">
      <input
        v-model="search"
        placeholder="Search patient, doctor…"
        class="form-input max-w-xs border border-gray-300 rounded-lg px-3"
      />
      <select
        v-model="filterStatus"
        class="w-44 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-gray-500 font-medium">
      Loading lab requests...
    </div>

    <div v-else class="card overflow-hidden border border-gray-100 shadow-sm rounded-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-gray-500">
              <th class="p-4 font-semibold">ID</th>
              <th class="p-4 font-semibold">Patient</th>
              <th class="p-4 font-semibold">Date</th>
              <th class="p-4 font-semibold">Test Results</th>
              <th class="p-4 font-semibold">Notes</th>
              <th class="p-4 font-semibold">Status</th>
              <th class="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in filtered" :key="req.request_id" class="border-b border-gray-50 hover:bg-blue-50 transition-colors">
              <td class="p-4 font-mono text-primary-700 font-semibold">#{{ req.request_id }}</td>
              <td class="p-4 font-medium text-gray-900">{{ req.patient.first_name }} {{ req.patient.last_name }}</td>
              <td class="p-4 text-gray-600">{{ formatDate(req.request_date) }}</td>
              <td class="p-4">
                <div class="flex flex-wrap gap-1">
                  <span v-if="req.results.length === 0" class="text-gray-400 text-xs italic">None yet</span>
                  <span v-for="r in req.results" :key="r.result_id"
                    class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {{ r.TestType?.test_name || '—' }}
                  </span>
                </div>
              </td>
              <td class="p-4 max-w-[140px] truncate text-gray-500 text-xs italic">{{ req.notes || '—' }}</td>
              <td class="p-4"><StatusBadge :status="req.status" /></td>
              <td class="p-4">
                <div class="flex gap-3">
                  <button @click="openDetail(req)" class="text-xs text-blue-600 hover:text-blue-800 font-bold">View</button>
                  <button @click="openEdit(req)" class="text-xs text-amber-600 hover:text-amber-800 font-bold">Edit</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="text-center text-gray-400 py-10 font-medium">No requests found matching your filters.</td>
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
            <label class="block text-sm font-bold text-gray-700 mb-1">Patient</label>
            <select v-model="form.patient_id" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="" disabled>Select patient…</option>
              <option v-for="p in dbPatients" :key="p.patient_id" :value="p.patient_id">
                {{ p.first_name }} {{ p.last_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Doctor</label>
            <select v-model="form.doctor_id" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="" disabled>Select doctor…</option>
              <option v-for="d in dbDoctors" :key="d.doctor_id" :value="d.doctor_id">
                Dr. {{ d.first_name }} {{ d.last_name }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Notes</label>
          <textarea v-model="form.notes" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none" placeholder="Clinical notes…"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" @click="showCreate = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md">
            {{ isSaving ? 'Creating...' : 'Create Request' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Detail Modal -->
    <Modal v-model="showDetail" :title="`Request #${selected?.request_id}`">
      <div v-if="selected" class="space-y-5">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="bg-gray-50 rounded-xl p-4 space-y-1 border border-gray-100">
            <p class="font-bold text-gray-800 mb-2">Patient</p>
            <p class="font-medium">{{ selected.patient.first_name }} {{ selected.patient.last_name }}</p>
            <p class="text-gray-500">📧 {{ selected.patient.email || 'No email' }}</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-4 space-y-1 border border-blue-100">
            <p class="font-bold text-blue-900 mb-2">Requesting Doctor</p>
            <p class="font-medium text-blue-800">Dr. {{ selected.doctor.first_name }} {{ selected.doctor.last_name }}</p>
            <p class="text-blue-600">{{ selected.doctor.specialization || 'General' }}</p>
            <p class="text-blue-600">📧 {{ selected.doctor.email || 'No email' }}</p>
          </div>
        </div>

        <div v-if="selected.notes" class="text-sm text-gray-600 italic bg-gray-50 rounded-xl p-4 border border-gray-100">
          Notes: {{ selected.notes }}
        </div>

        <div>
          <p class="font-bold text-gray-800 text-sm mb-2">Test Results</p>
          <div v-if="selected.results.length === 0" class="text-gray-400 text-sm italic p-3 bg-gray-50 rounded-xl">
            No results recorded yet.
          </div>
          <div v-else class="space-y-2">
            <div v-for="r in selected.results" :key="r.result_id"
              class="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-green-800">{{ r.TestType?.test_name || 'Lab Result' }}</span>
                <span class="text-xs text-gray-500">{{ formatDate(r.result_date) }}</span>
              </div>
              <p class="text-gray-900 font-medium text-base my-1">{{ r.result_value }}</p>
              <p v-if="r.remarks" class="text-gray-600 text-xs italic">Notes: {{ r.remarks }}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Edit Modal -->
    <Modal v-model="showEdit" title="Update Request Status">
      <form v-if="editReq" @submit.prevent="submitEdit" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Status</label>
          <select v-model="editReq.status" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Notes</label>
          <textarea v-model="editReq.notes" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" @click="showEdit = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-md">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import StatusBadge from '@/components/StatusBadge.vue'
import Modal from '@/components/Modal.vue'

const isLoading = ref(true)
const isSaving = ref(false)
const search = ref('')
const filterStatus = ref('')

const showCreate = ref(false)
const showDetail = ref(false)
const showEdit = ref(false)

const requests = ref<any[]>([])
const dbPatients = ref<any[]>([])
const dbDoctors = ref<any[]>([])

const selected = ref<any | null>(null)
const editReq = ref<any | null>(null)

const form = reactive({ patient_id: '', doctor_id: '', notes: '' })

async function fetchData() {
  try {
    isLoading.value = true

    const [{ data: pData }, { data: dData }] = await Promise.all([
      supabase.from('Patient').select('*'),
      supabase.from('Doctor').select('*')
    ])

    dbPatients.value = pData || []
    dbDoctors.value = dData || []

    const { data: reqData, error } = await supabase
      .from('LabRequest')
      .select(`
        *,
        Patient (*),
        Doctor (*),
        TestResult (
          *,
          TestType (*)
        )
      `)
      .order('request_date', { ascending: false })

    if (error) throw error

    requests.value = (reqData || []).map(r => ({
      request_id: r.request_id,
      status: r.status,
      notes: r.notes,
      request_date: r.request_date,
      patient: r.Patient || {},
      doctor: r.Doctor || {},
      results: r.TestResult || []
    }))
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

const filtered = computed(() =>
  requests.value.filter(r => {
    const q = search.value.toLowerCase()
    const matchSearch = !q ||
      `${r.patient.first_name} ${r.patient.last_name}`.toLowerCase().includes(q) ||
      `${r.doctor.first_name} ${r.doctor.last_name}`.toLowerCase().includes(q) ||
      String(r.request_id).includes(q)
    const matchStatus = !filterStatus.value || r.status === filterStatus.value
    return matchSearch && matchStatus
  })
)

function openDetail(req: any) {
  selected.value = req
  showDetail.value = true
}

function openEdit(req: any) {
  editReq.value = { request_id: req.request_id, status: req.status, notes: req.notes }
  showEdit.value = true
}

async function submitCreate() {
  isSaving.value = true
  try {
    const { error } = await supabase
      .from('LabRequest')
      .insert({
        patient_id: form.patient_id,
        doctor_id: form.doctor_id,
        notes: form.notes,
        status: 'Pending',
        request_date: new Date().toISOString().split('T')[0]
      })

    if (error) throw error

    Object.assign(form, { patient_id: '', doctor_id: '', notes: '' })
    showCreate.value = false
    await fetchData()
  } catch (err) {
    console.error('Failed to create request:', err)
    alert('Could not create request. Check console.')
  } finally {
    isSaving.value = false
  }
}

async function submitEdit() {
  if (!editReq.value) return
  isSaving.value = true
  try {
    const { error } = await supabase
      .from('LabRequest')
      .update({ status: editReq.value.status, notes: editReq.value.notes })
      .eq('request_id', editReq.value.request_id)

    if (error) throw error
    showEdit.value = false
    await fetchData()
  } catch (err) {
    console.error('Failed to update request:', err)
  } finally {
    isSaving.value = false
  }
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
