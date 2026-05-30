<template>
  <div class="space-y-6">
    
    <div>
      <h2 class="text-2xl font-mono font-bold text-[#18265F] mt-2">Dashboard</h2>
      <p class="text-gray-500 text-sm mt-1">Overview of all Technicians in this Clinic</p>
    </div>
    
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="🔬" label="Total Technicians" :value="Technicians.length" iconBg="bg-blue-100" />
    </div>

    <div class="card overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100">
      <div class="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 class="font-semibold font-inter text-[#18265F]">Technicians</h3>
        <RouterLink to="/admin/technicianslist" class="text-sm text-primary-600 hover:text-primary-800 font-medium">
          View all →
        </RouterLink>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
              <th class="p-4 font-semibold">Technician ID</th>
              <th class="p-4 font-semibold">First Name</th>
              <th class="p-4 font-semibold">Middle Initial</th>
              <th class="p-4 font-semibold">Last Name</th>
              <th class="p-4 font-semibold">License Number</th>
              <th class="p-4 font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            
            <tr v-if="isLoading">
              <td colspan="6" class="p-8 text-center text-gray-400 font-medium">Loading technicians...</td>
            </tr>
            
            <tr v-else-if="Technicians.length === 0">
              <td colspan="6" class="p-8 text-center text-gray-400 font-medium">No Technicians found in the database.</td>
            </tr>

            <tr v-else v-for="technician in Technicians" :key="technician.technician_id" class="border-b border-gray-50 hover:bg-blue-50 transition-colors">
              <td class="p-4 font-mono text-primary-700 font-medium">#{{ technician.technician_id }}</td>
              <td class="p-4 font-bold text-gray-900">{{ technician.first_name }}</td>
              <td class="p-4 font-bold text-gray-900">{{ technician.middle_name || '—' }}</td>
              <td class="p-4 font-bold text-gray-900">{{ technician.last_name }}</td>
              <td class="p-4 text-gray-600 font-medium">{{ technician.license_number }}</td>
              <td class="p-4 text-gray-600">{{ technician.email || 'No email' }}</td>
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
import StatCard from '@/components/StatCard.vue'
import { technicianListings } from '@/services/technicianListings' // Make sure this matches your filename

const isLoading = ref(true)
const Technicians = ref<any[]>([])

onMounted(async () => {
  try {
    isLoading.value = true
    
    // Fetch ALL technicians using the service
    const data = await technicianListings.getAllTechnician()
    
    if (data) {
      Technicians.value = data
    }
    
    console.log("All Fetched Technicians:", Technicians.value)
  } catch (error) {
    console.error("Could not load technicians:", error)
  } finally {
    isLoading.value = false
  }
})
</script>