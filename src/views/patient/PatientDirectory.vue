<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div><h2 class="text-2xl font-bold text-gray-900">Patient Directory</h2><p class="text-gray-500 text-sm mt-0.5">Browse registered patients</p></div>
    </div>
    <input v-model="search" placeholder="Search patients…" class="form-input max-w-sm" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="p in filtered" :key="p.patient_id" class="card p-5">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-xl">
            {{ p.first_name[0] }}{{ p.last_name[0] }}
          </div>
          <div>
            <p class="font-semibold text-gray-900">{{ p.first_name }} {{ p.middle_name }} {{ p.last_name }}</p>
            <p class="text-xs text-primary-600">{{ p.patient_id }}</p>
          </div>
        </div>
        <div class="space-y-1.5 text-sm text-gray-500">
          <p>🎂 {{ p.date_of_birth }} ({{ age(p.date_of_birth) }} yrs)</p>
          <p>⚥ {{ p.sex }}</p>
          <p>📞 {{ p.contact_number }}</p>
          <p>📧 {{ p.email }}</p>
          <p>📍 {{ p.address }}</p>
          <p>📏 {{ p.height }} cm · {{ p.weight }} kg · BMI {{ bmi(p.weight, p.height) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLabStore } from '@/stores/lab'

const store  = useLabStore()
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return store.patients.filter(p => !q || `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(q))
})

function age(dob: string) { return new Date().getFullYear() - new Date(dob).getFullYear() }
function bmi(w: number, h: number) { return !w || !h ? '—' : (w / ((h/100) ** 2)).toFixed(1) }
</script>
