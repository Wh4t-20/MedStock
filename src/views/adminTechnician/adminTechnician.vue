<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Technicians</h2>
        <p class="text-gray-500 text-sm mt-0.5">Licensed Technicians Directory</p>
      </div>
      <button @click="openCreate" class="btn-primary">+ Add Technician</button>
    </div>
    
    <input v-model="search" placeholder="Search by name, email, specialization…" class="form-input max-w-sm w-full border border-gray-300 rounded-md px-3 py-2" />
    
    <div v-if="isLoading" class="text-center py-12 text-gray-500 font-medium">Loading technicians...</div>
    <div v-else-if="filteredDoctors.length === 0" class="text-center py-12 text-gray-500 font-medium">No technicians match your search.</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="d in filteredDoctors" :key="d.doctor_id" class="card p-5 bg-white shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">🩺</div>
          <span class="font-mono text-xs text-primary-600 bg-blue-50 px-2 py-1 rounded-lg">#{{ d.doctor_id }}</span>
        </div>
        
        <h3 class="font-semibold text-gray-900">Dr. {{ d.first_name }} {{ d.last_name }}</h3>
        <p class="text-sm text-primary-600 font-medium mt-0.5">{{ d.specialization }}</p>
        <p class="text-sm text-primary-600 font-small mt-0.5">{{ d.license_number }}</p>

        <div class="mt-3 space-y-1 text-sm text-gray-500">
          <p>📧 {{ d.email || 'No email' }}</p>
          <p>📞 {{ d.contact_number || 'No contact' }}</p>
        </div>
        
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(d)" class="btn-secondary text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors">Edit</button>
          <button @click="del(d.doctor_id)" class="btn-danger text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Technician' : 'Add Technician'">
      <form @submit.prevent="submit" class="space-y-4">
        
        <div class="grid grid-cols-3 gap-3">
          <div><label class="block text-sm font-bold text-gray-700 mb-1">First Name</label><input v-model="form.first_name" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-1">Middle</label><input v-model="form.middle_name" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-1">Last Name</label><input v-model="form.last_name" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
        </div>
        
        <div><label class="block text-sm font-bold text-gray-700 mb-1">Specialization</label><input v-model="form.specialization" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
        
        <div><label class="block text-sm font-bold text-gray-700 mb-1">Email</label><input type="email" v-model="form.email" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
        <div><label class="block text-sm font-bold text-gray-700 mb-1">Contact Number</label><input v-model="form.contact_number"  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
        
        <div class="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
          <button type="button" @click="showModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors">
            {{ isSaving ? 'Saving...' : (editMode ? 'Save' : 'Add Technician') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Modal from '@/components/Modal.vue'
import { doctorListings } from '@/services/doctorListings'

// State
const search = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
const Doctors = ref<any[]>([])

// Modal & Form State
const showModal = ref(false)
const editMode = ref(false)
const editId = ref('')

const blankForm = () => ({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  contact_number: '',
  specialization: '',
  license_number: ''
})

const form = ref({ ...blankForm() })

// --- FETCH DATA ---
const fetchDoctors = async () => {
  try {
    isLoading.value = true
    const data = await doctorListings.getAllDoctors()
    if (data) Doctors.value = data
  } catch (error) {
    console.error("Failed to load doctors:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDoctors()
})

// --- SEARCH FILTER ---
const filteredDoctors = computed(() => {
  if (!search.value) return Doctors.value
  
  const query = search.value.toLowerCase()
  return Doctors.value.filter((d) => 
    d.first_name?.toLowerCase().includes(query) ||
    d.last_name?.toLowerCase().includes(query) ||
    d.specialization?.toLowerCase().includes(query) ||
    d.email?.toLowerCase().includes(query)
  )
})

// --- CRUD MODAL LOGIC ---
function openCreate() { 
  form.value = blankForm()
  editMode.value = false 
  showModal.value = true 
}

function openEdit(d: any) { 
  form.value = {
    first_name: d.first_name || '',
    middle_name: d.middle_name || '',
    last_name: d.last_name || '',
    email: d.email || '',
    contact_number: d.contact_number || '',
    specialization: d.specialization || '',
    license_number: d.license_number || ''
  }
  editId.value = d.doctor_id 
  editMode.value = true 
  showModal.value = true 
}

async function del(id: string) { 
  if (confirm('Are you sure you want to delete this doctor?')) {
    try {
      await doctorListings.deleteDoctor(id) // Ensure you have this function in doctorListings!
      await fetchDoctors()
    } catch (error) {
      console.error(error)
      alert("Failed to delete doctor.")
    }
  } 
}

async function submit() { 
  isSaving.value = true
  try {
    if (editMode.value) {
      await doctorListings.updateDoctor(editId.value, form.value) // Ensure this exists in doctorListings!
    } else {
      await doctorListings.createDoctor(form.value) // Ensure this exists in doctorListings!
    }
    showModal.value = false 
    await fetchDoctors()
  } catch (error) {
    console.error(error)
    alert("Failed to save doctor.")
  } finally {
    isSaving.value = false
  }
}
</script>