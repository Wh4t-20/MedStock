<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">My Profile</h2>
      <p class="text-gray-500 text-sm mt-0.5">Your personal information on record</p>
    </div>

    <div v-if="loading" class="card p-12 text-center text-gray-400">Loading profile...</div>

    <div v-else-if="!patient" class="card p-12 text-center text-gray-400">No profile found.</div>

    <div v-else class="card p-6 max-w-2xl">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-2xl bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-2xl">
          {{ patient.first_name?.[0] }}{{ patient.last_name?.[0] }}
        </div>
        <div>
          <p class="text-xl font-bold text-gray-900">
            {{ patient.first_name }} {{ patient.middle_name }} {{ patient.last_name }}
          </p>
          <p class="text-sm text-primary-600 font-mono">ID: {{ patient.patients_id }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-400 text-xs mb-1">Date of Birth</p>
          <p class="font-medium text-gray-800">{{ patient.birth_date }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-1">Sex</p>
          <p class="font-medium text-gray-800">
            {{ patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex }}
          </p>
        </div>
        <div>
          <p class="text-gray-400 text-xs mb-1">Email</p>
          <p class="font-medium text-gray-800">{{ patient.email || '—' }}</p>
        </div>
        <div v-if="contactNumber">
          <p class="text-gray-400 text-xs mb-1">Contact Number</p>
          <p class="font-medium text-gray-800">{{ contactNumber }}</p>
        </div>
        <div class="col-span-2">
          <p class="text-gray-400 text-xs mb-1">Address</p>
          <p class="font-medium text-gray-800">{{ patient.address || '—' }}</p>
        </div>
        <div v-if="patient.height">
          <p class="text-gray-400 text-xs mb-1">Height</p>
          <p class="font-medium text-gray-800">{{ patient.height }} cm</p>
        </div>
        <div v-if="patient.weight">
          <p class="text-gray-400 text-xs mb-1">Weight</p>
          <p class="font-medium text-gray-800">{{ patient.weight }} kg</p>
        </div>
        <div v-if="patient.height && patient.weight">
          <p class="text-gray-400 text-xs mb-1">BMI</p>
          <p class="font-medium text-gray-800">{{ bmi(patient.weight, patient.height) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabase'

const patient       = ref<any>(null)
const contactNumber = ref('')
const loading       = ref(true)

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: p } = await supabase
      .from('Patient')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!p) return
    patient.value = p

    const { data: contact } = await supabase
      .from('PatientContactNumber')
      .select('pcontact_number')
      .eq('patient_id', p.patients_id)
      .maybeSingle()

    if (contact) contactNumber.value = contact.pcontact_number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function bmi(w: number, h: number) { return (w / ((h / 100) ** 2)).toFixed(1) }
</script>
