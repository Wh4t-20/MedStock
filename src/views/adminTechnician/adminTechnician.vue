<template>
  <div class="space-y-5">
    
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Technicians</h2>
        <p class="text-gray-500 text-sm mt-0.5">Licensed Technicians Directory</p>
      </div>
      <button @click="openCreate" class="btn-primary">+ Add Technician</button>
    </div>
    
    <input v-model="search" placeholder="Search by name, email, license number…" class="form-input max-w-sm w-full border border-gray-300 rounded-md px-3 py-2" />
    
    <div v-if="isLoading" class="text-center py-12 text-gray-500 font-medium">Loading technicians...</div>
    <div v-else-if="filteredTechnicians.length === 0" class="text-center py-12 text-gray-500 font-medium">No technicians match your search.</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="t in filteredTechnicians" :key="t.technician_id" class="card p-5 bg-white shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">🔬</div>
          <span class="font-mono text-xs text-primary-600 bg-blue-50 px-2 py-1 rounded-lg">#{{ t.technician_id }}</span>
        </div>
        
        <h3 class="font-semibold text-gray-900">{{ t.first_name }} {{ t.last_name }}</h3>
        <p class="text-sm text-primary-600 font-medium mt-0.5">License: {{ t.license_number }}</p>

        <div class="mt-3 space-y-1 text-sm text-gray-500">
          <p>📧 {{ t.email || 'No email' }}</p>
          <p>📞 {{ t.LabTechContactNumber?.[0]?.tcontact_number || 'No contact' }}</p>
        </div>
        
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(t)" class="btn-secondary text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors">Edit</button>
          <button @click="del(t.technician_id)" class="btn-danger text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Technician' : 'Add Technician'">
      <form @submit.prevent="submit" class="space-y-4">
        
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">First Name</label>
            <input v-model="form.first_name" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Middle</label>
            <input v-model="form.middle_name" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
            <input v-model="form.last_name" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">License Number</label>
          <input v-model="form.license_number" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input type="email" v-model="form.email" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Contact Number</label>
            <input type="tel" v-model="form.contact_number" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
        
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
import { technicianListings } from '@/services/technicianListings' 

const search = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
const Technicians = ref<any[]>([])

const showModal = ref(false)
const editMode = ref(false)
const editId = ref<number | null>(null) 

const blankForm = () => ({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  license_number: '',
  contact_number: '' // Added here!
})

const form = ref({ ...blankForm() })

const fetchTechnicians = async () => {
  try {
    isLoading.value = true
    const data = await technicianListings.getAllTechnician()
    if (data) Technicians.value = data
  } catch (error) {
    console.error("Failed to load technicians:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTechnicians()
})

const filteredTechnicians = computed(() => {
  if (!search.value) return Technicians.value
  
  const query = search.value.toLowerCase()
  return Technicians.value.filter((t) => 
    t.first_name?.toLowerCase().includes(query) ||
    t.last_name?.toLowerCase().includes(query) ||
    t.license_number?.toLowerCase().includes(query) ||
    t.email?.toLowerCase().includes(query)
  )
})

function openCreate() { 
  form.value = blankForm()
  editMode.value = false 
  showModal.value = true 
}

function openEdit(t: any) { 
  form.value = {
    first_name: t.first_name || '',
    middle_name: t.middle_name || '',
    last_name: t.last_name || '',
    email: t.email || '',
    license_number: t.license_number || '',
    // Map the contact number from the joined Supabase array
    contact_number: t.LabTechContactNumber?.[0]?.tcontact_number || '' 
  }
  editId.value = t.technician_id 
  editMode.value = true 
  showModal.value = true 
}

async function del(id: number) { 
  if (confirm('Are you sure you want to delete this technician?')) {
    try {
      await technicianListings.deleteTechnician(id) 
      await fetchTechnicians()
    } catch (error) {
      console.error(error)
      alert("Failed to delete technician.")
    }
  } 
}

async function submit() { 
  isSaving.value = true
  try {
    if (editMode.value && editId.value !== null) {
      await technicianListings.editTechnician(editId.value, form.value)
    } else {
      await technicianListings.addTechnician(form.value)
    }
    showModal.value = false 
    await fetchTechnicians()
  } catch (error) {
    console.error(error)
    alert("Failed to save technician.")
  } finally {
    isSaving.value = false
  }
}
</script>