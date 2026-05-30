<template>
  <div class="space-y-6">

    <div>
      <span v-if="isLoading" class="text-gray-500 font-medium">Loading...</span>
      <span v-else-if="currentDoctor" class="font-bold font-mono text-lg text-primary-700">
        Welcome, Dr. {{ currentDoctor.last_name }} the GOAT 🔥🔥🔥
      </span>
      <h2 class="text-2xl font-mono font-bold text-[#18265F] mt-2">Dashboard</h2>
      <p class="text-gray-500 text-sm mt-1">Overview of all laboratory activity</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="👥" label="Total Patients"  :value="patients.length"    iconBg="bg-blue-100" />
      <StatCard icon="📋" label="Total Requests"  :value="totalRequests"      iconBg="bg-indigo-100" />
      <StatCard icon="⏳" label="Pending"          :value="pendingRequests"    iconBg="bg-amber-100" />
      <StatCard icon="✅" label="Completed"        :value="completedRequests"  iconBg="bg-green-100" />
    </div>

    <div class="card overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100">
      <div class="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 class="font-semibold font-inter text-[#18265F]">My Patients</h3>
        <RouterLink to="/doctor/patients" class="text-sm text-primary-600 hover:text-primary-800 font-medium">
          View all →
        </RouterLink>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
              <th class="p-4 font-semibold">Patient ID</th>
              <th class="p-4 font-semibold">First Name</th>
              <th class="p-4 font-semibold">Middle Name</th>
              <th class="p-4 font-semibold">Last Name</th>
              <th class="p-4 font-semibold">Date of Birth</th>
              <th class="p-4 font-semibold">Sex</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="p-8 text-center text-gray-400 font-medium">Loading your patients...</td>
            </tr>
            <tr v-else-if="patients.length === 0">
              <td colspan="6" class="p-8 text-center text-gray-400 font-medium">No patients assigned to you yet.</td>
            </tr>
            <tr v-else v-for="patient in patients" :key="patient.patient_id" class="border-b border-gray-50 hover:bg-blue-50 transition-colors">
              <td class="p-4 font-mono text-primary-700 font-medium">#{{ patient.patient_id }}</td>
              <td class="p-4 font-bold text-gray-900">{{ patient.first_name }}</td>
              <td class="p-4 font-bold text-gray-900">{{ patient.middle_name }}</td>
              <td class="p-4 font-bold text-gray-900">{{ patient.last_name }}</td>
              <td class="p-4 text-gray-600">{{ patient.date_of_birth }}</td>
              <td class="p-4 text-gray-600">{{ patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other' }}</td>
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
import { supabase } from '@/api/supabase'
import StatCard from '@/components/StatCard.vue'
import { doctorListings } from '@/services/doctorListings'
import { patientListings } from '@/services/patientListings'

const currentDoctor = ref<any>(null)
const isLoading = ref(true)
const patients = ref<any[]>([])
const totalRequests = ref(0)
const pendingRequests = ref(0)
const completedRequests = ref(0)

onMounted(async () => {
  try {
    currentDoctor.value = await doctorListings.getCurrentDoctorProfile()

    if (currentDoctor.value) {
      const [patientsData, totalRes, pendingRes, completedRes] = await Promise.all([
        patientListings.getPatientsByDoctor(currentDoctor.value.doctor_id),
        supabase.from('LabRequest').select('*', { count: 'exact', head: true }),
        supabase.from('LabRequest').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('LabRequest').select('*', { count: 'exact', head: true }).eq('status', 'Completed')
      ])
      patients.value = patientsData || []
      totalRequests.value = totalRes.count || 0
      pendingRequests.value = pendingRes.count || 0
      completedRequests.value = completedRes.count || 0
    }
  } catch (error) {
    console.error('Could not load dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
