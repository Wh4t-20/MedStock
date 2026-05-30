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

      <div class="relative w-48">
        <select 
          v-model="filterStatus" 
          class="w-44 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer transition-colors duration-150 ease-in-out focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="" class="text-gray-500">All Statuses</option>
          <option value="Pending" class="text-amber-600 font-medium">Pending</option>
          <option value="Processing" class="text-blue-600 font-medium">In Progress</option>
          <option value="Completed" class="text-green-600 font-medium">Completed</option>
          <option value="Cancelled" class="text-rose-600 font-medium">Cancelled</option>
        </select>
      </div>
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
          
              <td class="p-4 max-w-[140px] truncate text-gray-500 text-xs italic">{{ req.notes || '—' }}</td>
              <td class="p-4"><StatusBadge :status="req.status" /></td>
              <td class="p-4">
                <div class="flex gap-3">
                  <button @click="openDetail(req)" class="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors">View</button>
                  <button @click="openUpdate(req)" class="text-xs text-amber-600 hover:text-amber-800 font-bold transition-colors">Update</button>
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

    <Modal v-model="showCreate" title="New Lab Request">
      <form @submit.prevent="submitCreate" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Patient</label>
            <select v-model="form.patient_id" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="" disabled>Select patient…</option>
              <option v-for="p in dbPatients" :key="p.patients_id" :value="p.patients_id">
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
          <label class="block text-sm font-bold text-gray-700 mb-1">Tests Requested</label>
          <div class="grid grid-cols-2 gap-2 mt-1">
            <label v-for="tt in dbTestTypes" :key="tt.test_type_id"
              class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer text-sm transition-colors">
              <input type="checkbox" :value="tt.test_type_id" v-model="form.selectedTests" class="accent-blue-600 w-4 h-4" />
              <span class="font-medium text-gray-800">{{ tt.test_name }}</span>
            </label>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Notes</label>
          <textarea v-model="form.notes" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none" placeholder="Clinical notes…"></textarea>
        </div>
        
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
          <button type="button" @click="showCreate = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors">
            {{ isSaving ? 'Creating...' : 'Create Request' }}
          </button>
        </div>
      </form>
    </Modal>

    <Modal v-model="showDetail" :title="`Request #${selected?.request_id}`">
      <div v-if="selected" class="space-y-5">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="bg-gray-50 rounded-xl p-4 space-y-1 border border-gray-100">
            <p class="font-bold text-gray-800 mb-2">Patient</p>
            <p class="font-medium">{{ selected.patient.first_name }} {{ selected.patient.last_name }}</p>
            <p class="text-gray-500">📧 {{ selected.patient.email || 'No email' }}</p>
            <p class="text-gray-500">📞 {{ selected.patient.contact_number || 'No contact' }}</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-4 space-y-1 border border-blue-100">
            <p class="font-bold text-blue-900 mb-2">Requesting Doctor</p>
            <p class="font-medium text-blue-800">Dr. {{ selected.doctor.first_name }} {{ selected.doctor.last_name }}</p>
            <p class="text-blue-600">{{ selected.doctor.specialization || 'General' }}</p>
            <p class="text-blue-600">📧 {{ selected.doctor.email || 'No email' }}</p>
          </div>
        </div>
        
        <div>
          <p class="font-bold text-gray-800 text-sm mb-2">Tests Ordered</p>
          <div class="space-y-2">
            <div v-for="d in selected.details" :key="d.detail_id || d.test_type.test_name"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-xl text-sm bg-white">
              <div>
                <span class="font-bold text-gray-800">{{ d.test_type.test_name }}</span>
                <span class="ml-2 text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded-md">{{ d.test_type.category || 'General' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selected.results && selected.results.length">
          <p class="font-bold text-gray-800 text-sm mb-2 pt-2 border-t border-gray-100">Completed Results</p>
          <div class="space-y-2">
            <div v-for="r in selected.results" :key="r.result_id"
              class="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-green-800">
                  {{ r.TestType?.test_name || 'Lab Result' }}
                </span>
                <span class="text-xs text-gray-500">{{ formatDate(r.result_date) }}</span>
              </div>
              <p class="text-gray-900 font-medium text-base my-2">{{ r.result_value }}</p>
              <p v-if="r.remarks" class="text-gray-600 text-xs italic">Notes: {{ r.remarks }}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <Modal v-model="showUpdate" title="Update Lab Request">
      <form v-if="updateForm" @submit.prevent="submitUpdate" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Patient</label>
            <select v-model="updateForm.patient_id" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option v-for="p in dbPatients" :key="p.patients_id" :value="p.patients_id">
                {{ p.first_name }} {{ p.last_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Doctor</label>
            <select v-model="updateForm.doctor_id" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option v-for="d in dbDoctors" :key="d.doctor_id" :value="d.doctor_id">
                Dr. {{ d.first_name }} {{ d.last_name }}
              </option>
            </select>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Tests Requested</label>
          <div class="grid grid-cols-2 gap-2 mt-1">
            <label v-for="tt in dbTestTypes" :key="tt.test_type_id"
              class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer text-sm transition-colors">
              <input type="checkbox" :value="tt.test_type_id" v-model="updateForm.selectedTests" class="accent-blue-600 w-4 h-4" />
              <span class="font-medium text-gray-800">{{ tt.test_name }}</span>
            </label>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Status</label>
          <select v-model="updateForm.status" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Pending</option>
            <option>Processing</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Notes</label>
          <textarea v-model="updateForm.notes" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none"></textarea>
        </div>
        
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
          <button type="button" @click="showUpdate = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors">
            {{ isSaving ? 'Updating...' : 'Update Request' }}
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
import Modal       from '@/components/Modal.vue'

// --- State Variables ---
const isLoading    = ref(true)
const isSaving     = ref(false)
const search       = ref('')
const filterStatus = ref('')

// Modal Toggles
const showCreate   = ref(false)
const showDetail   = ref(false)
const showUpdate   = ref(false)

// Data Arrays for the Dropdowns & Table
const requests    = ref<any[]>([])
const dbPatients  = ref<any[]>([])
const dbDoctors   = ref<any[]>([])
const dbTestTypes = ref<any[]>([])

// Selected Items
const selected    = ref<any | null>(null)
const updateForm  = ref<any | null>(null)

const form = reactive({
  patient_id: '', doctor_id: '', notes: '', selectedTests: [] as string[]
})

const fetchData = async () => {
  try {
    isLoading.value = true

    const [ { data: pData }, { data: dData }, { data: tData } ] = await Promise.all([
      supabase.from('Patient').select('*'),
      supabase.from('Doctor').select('*'),
      supabase.from('TestType').select('*')
    ])
    
    dbPatients.value  = pData || []
    dbDoctors.value   = dData || []
    dbTestTypes.value = tData || []

    // Fetch ALL Lab Requests and join the connected tables
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

    if (reqData) {
      requests.value = reqData.map(r => ({
        request_id: r.request_id,
        status: r.status, 
        notes: r.notes,
        request_date: r.request_date,
        patient: r.Patient || {},
        doctor: r.Doctor || {},
        details: (r.TestResult || []).map((tr: any) => ({
          detail_id: tr.result_id,
          test_type: tr.TestType || {}
        })),
        results: (r.TestResult || []).filter((tr: any) => tr.result_value !== null)
      }))
    }
  } catch (error) {
    console.error("Error loading data:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const filtered = computed(() =>
  requests.value.filter(r => {
    const q = search.value.toLowerCase()
    const matchSearch = !q ||
      `${r.patient.first_name} ${r.patient.last_name}`.toLowerCase().includes(q) ||
      `${r.doctor.first_name} ${r.doctor.last_name}`.toLowerCase().includes(q) ||
      String(r.request_id).toLowerCase().includes(q)
    const matchStatus = !filterStatus.value || r.status === filterStatus.value
    return matchSearch && matchStatus
  })
)

// --- Modal Handlers ---
function openDetail(req: any) { 
  selected.value = req 
  showDetail.value = true 
}

function openUpdate(req: any) {
  console.log("Opening Update for Request:", req); // <--- Add this!
  updateForm.value = {
    request_id: req.request_id, // Make sure this exactly matches your database column!
    patient_id: req.patient.patients_id || req.patient.patient_id,
    doctor_id: req.doctor.doctor_id,
    status: req.test_result || req.status, // Safely handle either column name
    notes: req.notes,
    selectedTests: req.details ? req.details.map((d: any) => d.test_type?.test_type_id).filter(Boolean) : []
  }
  showUpdate.value = true
}


async function submitCreate() {
  if (!form.selectedTests.length) return alert('Please select at least one test.')
  isSaving.value = true

  try {
    const { data: newReq, error: reqErr } = await supabase
      .from('LabRequest')
      .insert({
        patient_id: form.patient_id,
        doctor_id: form.doctor_id,
        notes: form.notes,
        status: 'Pending',
        request_date: new Date().toISOString()
      })
      .select()
      .single()

    if (reqErr) throw reqErr

    const testsToInsert = form.selectedTests.map(testId => ({
      request_id: newReq.request_id,
      test_type_id: testId
    }))

    const { error: testErr } = await supabase.from('TestResult').insert(testsToInsert)
    if (testErr) throw testErr

    Object.assign(form, { patient_id: '', doctor_id: '', notes: '', selectedTests: [] })
    showCreate.value = false
    await fetchData() 

  } catch (err) {
    console.error("Failed to create request:", err)
    alert("Could not create request. Check console.")
  } finally {
    isSaving.value = false
  }
}

async function submitUpdate() {
  if (!updateForm.value || !updateForm.value.selectedTests.length) {
    return alert('Please select at least one test.')
  }
  
  isSaving.value = true

  try {
    const reqId = updateForm.value.request_id

    const { error: reqErr } = await supabase
      .from('LabRequest')
      .update({
        patient_id: updateForm.value.patient_id,
        doctor_id: updateForm.value.doctor_id,
        status: updateForm.value.status,
        notes: updateForm.value.notes
      })
      .eq('request_id', reqId)

    if (reqErr) throw reqErr


    const { error: delErr } = await supabase
      .from('TestResult')
      .delete()
      .eq('request_id', reqId)
      
    if (delErr) throw delErr

    const testsToInsert = updateForm.value.selectedTests.map((testId: string) => ({
      request_id: reqId,
      test_type_id: testId
    }))

    const { error: testErr } = await supabase
      .from('TestResult')
      .insert(testsToInsert)

    if (testErr) throw testErr

    showUpdate.value = false
    await fetchData()
    
  } catch (err) {
    console.error("Failed to update full request:", err)
    alert("Could not update request. Check console.")
  } finally {
    isSaving.value = false
  }
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>