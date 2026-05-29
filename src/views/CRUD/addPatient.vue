<template>
    <div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex justify-center pt-32 pb-12 px-4 overflow-y-auto">
    <header class="absolute top-6 left-8 flex items-center gap-3">
      
      <div class="w-10 h-10 bg-accent-400 rounded-xl flex items-center justify-center font-bold text-primary-900 text-xl shadow-md">M</div>
      
      <div class="flex flex-col text-left hidden sm:flex">
        <span class="text-white text-xl font-bold tracking-tight leading-none">MedLab<span class="text-accent-400">System</span></span>
        <span class="text-primary-300 text-xs mt-1">Medical Laboratory Management</span>
      </div>
      
    </header>
    <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8">
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <h2 class="text-2xl font-bold text-gray-900">Add New Patient</h2>
        <button @click="goBack" class="text-gray-500 hover:text-gray-800 font-medium transition-colors">
          ← Back to Admin
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-3 text-left">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">First Name</label>
            <input type="text" v-model="form.first_name" required class="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Middle</label>
            <input type="text" v-model="form.middle_name" class="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
            <input type="text" v-model="form.last_name" required class="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
            <input type="date" v-model="form.birth_date" required class="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Sex</label>
            <select v-model="form.sex" required class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Others</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Weight (kg)</label>
            <input type="number" step="0.01" v-model="form.weight" class="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Height (cm)</label>
            <input type="number" step="0.01" v-model="form.height" class="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input type="email" v-model="form.email" class="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input type="tel" v-model="form.contact_number" class="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Address</label>
          <input type="text" v-model="form.address" class="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>

        <div class="mt-6 p-5 bg-blue-50 rounded-lg border border-blue-100">
          <label class="block text-sm font-bold text-blue-900 mb-2">Assign to Doctor:</label>
          <select v-model="selectedDoctorId" required class="w-full border border-blue-300 rounded-md px-3 py-2">
            <option value="" disabled>Select a doctor...</option>
            <option v-for="doc in doctorsList" :key="doc.doctor_id" :value="doc.doctor_id">
              Dr. {{ doc.first_name }} {{ doc.last_name }} - {{ doc.specialization }}
            </option>
          </select>
        </div>

        <div class="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button type="button" @click="goBack" class="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {{ isSubmitting ? 'Saving...' : 'Save Patient' }}
          </button>
        </div>
      </form>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { patientListings } from '@/services/patientListings'
import { doctorListings } from '@/services/doctorListings'

const router = useRouter()
const isSubmitting = ref(false)

// Data for the dropdown
const doctorsList = ref<any[]>([])
const selectedDoctorId = ref('')

// Added TypeScript typing so your editor stops yelling about the nulls!
const form = ref({
    first_name: '',
    middle_name: '',
    last_name: '',
    birth_date: '',
    sex: 'O',
    address: '',
    weight: null as number | null,
    height: null as number | null,
    email: '',
    contact_number: ''
})

// Fetch doctors as soon as the Admin opens this page
onMounted(async () => {
  try {
    const fetchedDoctors = await doctorListings.getAllDoctors()
    // Make sure we have data before assigning it
    if (fetchedDoctors) {
      doctorsList.value = fetchedDoctors
    }
  } catch (error) {
    console.error("Could not load doctor list:", error)
  }
})

async function handleSubmit() {
  isSubmitting.value = true
  try {
    // We now pass the specifically selected doctor from the dropdown!
    await patientListings.addPatientAndLinkToDoctor(form.value, selectedDoctorId.value)
    
    alert("Patient successfully added and assigned to doctor!")
    
    // Automatically send the admin back to the CRUD dashboard
    goBack()
    
  } catch (error) {
    console.error("Error adding patient:", error)
    alert("Failed to add patient. Check console.")
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.push('/crud')
}
</script>