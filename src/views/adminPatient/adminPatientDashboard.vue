<template>
  <div class="space-y-6">
    
    <div>
        <h2 class="text-2xl font-mono font-bold text-[#18265F] mt-2">Dashboard</h2>
        <p class="text-gray-500 text-sm mt-1">Overview of all Patients</p>
       
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="👥" label="Total Patients"    :value="Patients.length"          iconBg="bg-blue-100" />
    </div>

    <div class="card overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100">
      <div class="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 class="font-semibold font-inter text-[#18265F]">All Patients</h3>
        <RouterLink to="/admin-patient/patients" class="text-sm text-primary-600 hover:text-primary-800 font-medium">
          View all →
        </RouterLink>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
              <th class="p-4 font-bold">Patient ID</th>
              <th class="p-4 font-bold">First Name</th>
              <th class="p-4 font-bold">Middle Name</th>
              <th class="p-4 font-bold">Last Name</th>
              <th class="p-4 font-bold">Date of Birth</th>
              <th class="p-4 font-bold">Sex</th>
            </tr>
          </thead>
          <tbody>
            
            <tr v-if="isLoadingProfile">
              <td colspan="4" class="p-8 text-center text-gray-300 font-medium">Loading the patients...</td>
            </tr>
            
            <tr v-else-if="Patients.length === 0">
              <td colspan="6" class="p-8 text-center text-gray-400 font-medium">No patients seen in the DB.</td>
            </tr>

            <tr v-else v-for="patient in Patients" :key="patient.patients_id" class="border-b border-gray-50 hover:bg-blue-50 transition-colors">
              <td class="p-4 font-mono text-primary-700 text-sm">#{{ patient.patients_id }}</td>
              <td class="p-4 font-light font-public-sans text-[15px] text-black">{{ patient.first_name }}</td>
              <td class="p-4 font-light font-public-sans text-[15px] text-black"> {{ patient.middle_name }}</td>
              <td class="p-4 font-light font-public-sans text-[15px] text-black"> {{ patient.last_name }}</td>
              <td class="p-4 font-thin font-public-sans text-sm text-black">{{ patient.birth_date }}</td>
              <td class="p-4 font-thin font-public-sans text-sm text-black">{{ patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other' }}</td>
            </tr>
            
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard    from '@/components/StatCard.vue'
import { patientListings } from '@/services/patientListings'
import { RouterLink } from 'vue-router'

const isLoadingProfile = ref(true)
const Patients = ref<any[]>([])

onMounted(async () => {
  try {
    isLoadingProfile.value = true
    
    // Fetch ALL patients using the service function you already created
    const allPatients = await patientListings.getAllPatients()
    
    if (allPatients) {
      Patients.value = allPatients
    }
    
    console.log("All Fetched Patients:", Patients.value)
  } 
  catch (error) {
    console.error("Could not load patients:", error)
  } finally {
    isLoadingProfile.value = false
  }
})
</script>