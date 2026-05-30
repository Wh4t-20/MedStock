<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Patients</h2>
        <p class="text-gray-500 text-sm mt-0.5">Manage patient records</p>
      </div>
      <!--<button @click="openCreate" class="btn-primary" :disabled="isLoading">+ Add Patient</button>-->
    </div>

    <input v-model="search" placeholder="Search by name, email, contact…" class="form-input max-w-sm" />

    <div class="card overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
              <th class="p-4 font-semibold">ID</th>
              <th class="p-4 font-semibold">Name</th>
              <th class="p-4 font-semibold">DOB</th>
              <th class="p-4 font-semibold">Sex</th>
              <th class="p-4 font-semibold">Email</th>
              <th class="p-4 font-semibold">BMI</th>
              <th class="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="7" class="p-8 text-center text-gray-400 font-medium">Loading patients from database...</td>
            </tr>
            <tr v-else-if="filtered.length === 0">
              <td colspan="7" class="p-8 text-center text-gray-400 font-medium">No matching patients found.</td>
            </tr>
            <tr v-else v-for="p in filtered" :key="p.patients_id" class="border-b border-gray-50 hover:bg-blue-50 transition-colors">
              <td class="p-4 font-mono text-primary-700 font-semibold">#{{ p.patients_id }}</td>
              <td class="p-4 font-medium text-gray-900">{{ p.first_name }} {{ p.middle_name }} {{ p.last_name }}</td>
              <td class="p-4 text-gray-500 text-sm">{{ p.date_of_birth }}</td>
              <td class="p-4 text-gray-600 text-sm">{{ p.sex }}</td>
              <td class="p-4 text-gray-500 text-sm">{{ p.email || 'N/A' }}</td>
              <td class="p-4 text-gray-600 text-sm">{{ bmi(p.weight, p.height) }}</td>
              <td class="p-4">
                <div class="flex gap-3">
                  <button @click="openEdit(p)" class="text-xs text-amber-600 hover:text-amber-800 font-bold transition-colors">Edit</button>
                  <button @click="del(p.patients_id)" class="text-xs text-red-600 hover:text-red-800 font-bold transition-colors">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Patient' : 'Add Patient'">
      <form @submit.prevent="submit" class="space-y-4 text-left">
        <div class="grid grid-cols-3 gap-3">
          <div><label class="block text-xs font-bold text-gray-700 mb-1">First Name</label><input v-model="form.first_name" required class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" /></div>
          <div><label class="block text-xs font-bold text-gray-700 mb-1">Middle</label><input v-model="form.middle_name" class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" /></div>
          <div><label class="block text-xs font-bold text-gray-700 mb-1">Last Name</label><input v-model="form.last_name" required class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" /></div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label><input type="date" v-model="form.birth_date" required class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" /></div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Sex</label>
            <select v-model="form.sex" required class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-bold text-gray-700 mb-1">Height (cm)</label><input type="number" step="0.01" v-model.number="form.height" class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" /></div>
          <div><label class="block text-xs font-bold text-gray-700 mb-1">Weight (kg)</label><input type="number" step="0.01" v-model.number="form.weight" class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" /></div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-bold text-gray-700 mb-1">Email</label><input type="email" v-model="form.email" class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" /></div>
          <div><label class="block text-xs font-bold text-gray-700 mb-1">Contact Number</label><input type="tel" v-model="form.contact_number" class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" /></div>
        </div>

        <div><label class="block text-xs font-bold text-gray-700 mb-1">Address</label><input v-model="form.address" class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" /></div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button type="button" @click="showModal = false" class="px-5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md font-medium">Cancel</button>
          <button type="submit" :disabled="isSaving" class="px-5 py-1.5 text-sm bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:opacity-50">
            {{ isSaving ? 'Saving...' : (editMode ? 'Save Changes' : 'Add Patient') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import Modal from '@/components/Modal.vue'
import { doctorListings } from '@/services/doctorListings'
import { patientListings } from '@/services/patientListings'

const currentDoctor = ref<any>(null)
const dbPatients = ref<any[]>([])
const isLoading = ref(true)
const isSaving = ref(false)

const search = ref('')
const showModal = ref(false)
const editMode = ref(false)
const editId = ref<number | null>(null)

const blank = () => ({
  first_name: '', middle_name: '', last_name: '', birth_date: '', sex: 'F',
  email: '', contact_number: '', address: '', height: null as number | null, weight: null as number | null
})
const form = reactive({ ...blank() })

onMounted(async () => {
  await loadData()
})

async function loadData() {
  isLoading.value = true
  try {
    currentDoctor.value = await doctorListings.getCurrentDoctorProfile()
    if (currentDoctor.value) {
      dbPatients.value = await patientListings.getPatientsByDoctor(currentDoctor.value.doctor_id)
    }
  } catch (error) {
    console.error('Error loading patients:', error)
  } finally {
    isLoading.value = false
  }
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return dbPatients.value.filter(p =>
    !q || `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(q)
  )
})

function bmi(w: number, h: number) {
  if (!w || !h) return '—'
  return (w / ((h / 100) ** 2)).toFixed(1)
}

function openCreate() {
  Object.assign(form, blank())
  editMode.value = false
  showModal.value = true
}

function openEdit(p: any) {
  const { patients_id, ...rest } = p
  Object.assign(form, rest)
  editId.value = patients_id
  editMode.value = true
  showModal.value = true
}

async function del(id: number) {
  if (!confirm('Are you sure you want to delete this patient? This cannot be undone.')) return
  try {
    await patientListings.deletePatient(id)
    await loadData()
  } catch (error) {
    console.error(error)
    alert('Failed to delete patient. Check console.')
  }
}

async function submit() {
  isSaving.value = true
  try {
    if (editMode.value && editId.value !== null) {
      await patientListings.updatePatient(editId.value, { ...form })
    } else {
      await patientListings.addPatientAndLinkToDoctor({ ...form }, currentDoctor.value.doctor_id)
    }
    showModal.value = false
    await loadData()
  } catch (error) {
    console.error('Save failed:', error)
    alert('Failed to save patient. Check console.')
  } finally {
    isSaving.value = false
  }
}
</script>
