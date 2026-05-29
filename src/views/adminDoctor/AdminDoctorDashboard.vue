<template>
  <div class="space-y-6">
    
    <div>
      <h2 class="text-2xl font-mono font-bold text-[#18265F] mt-2">Dashboard</h2>
      <p class="text-gray-500 text-sm mt-1">Overview of all Doctors in this Clinic</p>
    </div>
    
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="⚕️" label="Total Doctors"    :value="Doctors.length"          iconBg="bg-blue-100" />
    </div>

    <div class="card overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100">
      <div class="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 class="font-semibold font-inter text-[#18265F]">Doctors</h3>
        <RouterLink to="/admin-doctor/doctorslist" class="text-sm text-primary-600 hover:text-primary-800 font-medium">
          View all →
        </RouterLink>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
              <th class="p-4 font-semibold">Doctor ID</th>
              <th class="p-4 font-semibold">First Name</th>
              <th class="p-4 font-semibold">Middle Initial</th>
              <th class="p-4 font-semibold">Last Name</th>
              <th class="p-4 font-semibold">Specialization</th>
              <th class="p-4 font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            
            <tr v-if="isLoadingProfile">
              <td colspan="6" class="p-8 text-center text-gray-400 font-medium">Loading doctors...</td>
            </tr>
            
            <tr v-else-if="Doctors.length === 0">
              <td colspan="6" class="p-8 text-center text-gray-400 font-medium">No Doctors found in the database.</td>
            </tr>

            <tr v-else v-for="doctor in Doctors" :key="doctor.doctor_id" class="border-b border-gray-50 hover:bg-blue-50 transition-colors">
              <td class="p-4 font-mono text-primary-700 font-medium">#{{ doctor.doctor_id }}</td>
              <td class="p-4 font-bold text-gray-900">{{ doctor.first_name }}</td>
              <td class="p-4 font-bold text-gray-900">{{ doctor.middle_name || '—' }}</td>
              <td class="p-4 font-bold text-gray-900">{{ doctor.last_name }}</td>
              <td class="p-4 text-gray-600 font-medium">{{ doctor.specialization }}</td>
              <td class="p-4 text-gray-600">{{ doctor.email || 'No email' }}</td>
            </tr>
            
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import StatCard    from '@/components/StatCard.vue'
import { doctorListings } from '@/services/doctorListings' 

const isLoadingProfile = ref(true)
const Doctors = ref<any[]>([])

onMounted(async () => {
  try {
    isLoadingProfile.value = true
    
    // Fetch ALL doctors using your service
    const allDoctors = await doctorListings.getAllDoctors()
    
    if (allDoctors) {
      Doctors.value = allDoctors
    }
    
    console.log("All Fetched Doctors:", Doctors.value)
  } 
  catch (error) {
    console.error("Could not load doctors:", error)
  } finally {
    isLoadingProfile.value = false
  }
})
</script>
