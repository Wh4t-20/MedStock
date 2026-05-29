<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Patients</h2>
        <p class="text-gray-500 text-sm mt-0.5">List of all registered Patients</p>
      </div>
    </div>

    <div v-if="isLoadingProfile" class="text-center py-10 text-gray-500 font-medium">Loading patients...</div>
    <div v-else-if="Patients.length === 0" class="text-center py-10 text-gray-500 font-medium">No patients found.</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="p in Patients" :key="p.patients_id" class="card p-5 bg-white shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
        
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">👥</div>
          <span class="font-mono text-xs text-primary-600 bg-blue-50 px-2 py-1 rounded-lg">#{{ p.patients_id }}</span>
        </div>
        
        <h3 class="font-semibold text-gray-900">{{ p.first_name }} {{ p.last_name }}</h3>
        <p class="text-sm text-primary-600 font-medium mt-0.5">Born: {{ p.birth_date }} • Sex: {{ p.sex }}</p>
        
        <div class="mt-3 space-y-1 text-sm text-gray-500">
          <p>📧 {{ p.email || 'No email' }}</p>
          <p>📞 {{ p.contact_number || 'No contact' }}</p>
        </div>
        
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(p)" class="btn-secondary text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors">Edit</button>
          <button @click="del(p.patients_id)" class="btn-danger text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium transition-colors">Delete</button>
        </div>

      </div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="'Edit Patient'">
      <form @submit.prevent="submit" class="space-y-4">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">First Name</label>
            <input v-model="form.first_name" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
            <input v-model="form.last_name" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
            <input type="date" v-model="form.birth_date" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Sex</label>
            <select v-model="form.sex" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Email</label>
          <input type="email" v-model="form.email" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Contact Number</label>
          <input type="tel" v-model="form.contact_number" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <button type="button" @click="showModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { patientListings } from '@/services/patientListings'
import Modal from '@/components/Modal.vue'

const router = useRouter()
const isLoadingProfile = ref(true)
const isSaving = ref(false)
const Patients = ref<any[]>([])

// Modal & Form State
const showModal = ref(false)
const currentEditId = ref<string | null>(null)

const form = ref({
  first_name: '',
  last_name: '',
  birth_date: '',
  sex: 'M',
  email: '',
  contact_number: ''
})

// Extract the fetch logic so we can call it after updating/deleting to refresh the screen
const fetchPatients = async () => {
  try {
    isLoadingProfile.value = true
    const allPatients = await patientListings.getAllPatients()
    if (allPatients) {
      Patients.value = allPatients
    }
  } catch (error) {
    console.error("Could not load patients:", error)
  } finally {
    isLoadingProfile.value = false
  }
}

onMounted(() => {
  fetchPatients()
})


const openEdit = (patient: any) => {
  currentEditId.value = patient.patients_id
  
  form.value = {
    first_name: patient.first_name || '',
    last_name: patient.last_name || '',
    birth_date: patient.birth_date || patient.date_of_birth || '',
    sex: patient.sex || 'M',
    email: patient.email || '',
    contact_number: patient.contact_number || ''
  }
  
  showModal.value = true
}

const submit = async () => {
  if (!currentEditId.value) return
  
  isSaving.value = true
  try {
    await patientListings.updatePatient(currentEditId.value, form.value)
    
    showModal.value = false
    await fetchPatients()
    
  } catch (error) {
    console.error("Error updating patient:", error)
    alert("Failed to update patient. Check console for details.")
  } finally {
    isSaving.value = false
  }
}

// 3. Delete a Patient
const del = async (id: string) => {
  if (!confirm("Are you sure you want to permanently delete this patient?")) {
    return
  }

  try {
    await patientListings.deletePatient(id)
    await fetchPatients() 
  } catch (error) {
    console.error("Error deleting patient:", error)
    alert("Failed to delete patient. They might be linked to existing lab requests.")
  }
}
</script>