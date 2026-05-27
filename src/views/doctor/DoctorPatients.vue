<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Patients</h2>
        <p class="text-gray-500 text-sm mt-0.5">Manage patient records</p>
      </div>
      <button @click="openCreate" class="btn-primary">+ Add Patient</button>
    </div>

    <input v-model="search" placeholder="Search by name, email, contact…" class="form-input max-w-sm" />

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-head">ID</th>
              <th class="table-head">Name</th>
              <th class="table-head">DOB</th>
              <th class="table-head">Sex</th>
              <th class="table-head">Contact</th>
              <th class="table-head">Email</th>
              <th class="table-head">BMI</th>
              <th class="table-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.patient_id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="table-cell font-mono text-primary-700 font-semibold">{{ p.patient_id }}</td>
              <td class="table-cell font-medium">{{ p.first_name }} {{ p.middle_name }} {{ p.last_name }}</td>
              <td class="table-cell text-gray-500">{{ p.date_of_birth }}</td>
              <td class="table-cell">{{ p.sex }}</td>
              <td class="table-cell text-gray-500">{{ p.contact_number }}</td>
              <td class="table-cell text-gray-500">{{ p.email }}</td>
              <td class="table-cell">{{ bmi(p.weight, p.height) }}</td>
              <td class="table-cell">
                <div class="flex gap-2">
                  <button @click="openEdit(p)" class="text-xs text-amber-600 hover:text-amber-800 font-medium">Edit</button>
                  <button @click="del(p.patient_id)" class="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Patient' : 'Add Patient'">
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-3 gap-3">
          <div><label class="form-label">First Name</label><input v-model="form.first_name" required class="form-input" /></div>
          <div><label class="form-label">Middle Name</label><input v-model="form.middle_name" class="form-input" /></div>
          <div><label class="form-label">Last Name</label><input v-model="form.last_name" required class="form-input" /></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Date of Birth</label><input type="date" v-model="form.date_of_birth" required class="form-input" /></div>
          <div>
            <label class="form-label">Sex</label>
            <select v-model="form.sex" required class="form-select">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Height (cm)</label><input type="number" v-model.number="form.height" required class="form-input" /></div>
          <div><label class="form-label">Weight (kg)</label><input type="number" v-model.number="form.weight" required class="form-input" /></div>
        </div>
        <div><label class="form-label">Email</label><input type="email" v-model="form.email" required class="form-input" /></div>
        <div><label class="form-label">Contact Number</label><input v-model="form.contact_number" required class="form-input" /></div>
        <div><label class="form-label">Address</label><input v-model="form.address" required class="form-input" /></div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">{{ editMode ? 'Save' : 'Add Patient' }}</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useLabStore } from '@/stores/lab'
import type { Patient } from '@/types'
import Modal from '@/components/Modal.vue'

const store = useLabStore()
const search = ref('')
const showModal = ref(false)
const editMode  = ref(false)
const editId    = ref('')

const blank = (): Omit<Patient,'patient_id'> => ({
  first_name:'', middle_name:'', last_name:'', date_of_birth:'', sex:'Female',
  email:'', contact_number:'', address:'', height:0, weight:0
})
const form = reactive<Omit<Patient,'patient_id'>>({ ...blank() })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return store.patients.filter(p =>
    !q || `${p.first_name} ${p.last_name} ${p.email} ${p.contact_number}`.toLowerCase().includes(q)
  )
})

function bmi(w: number, h: number) {
  if (!w || !h) return '—'
  return (w / ((h/100) ** 2)).toFixed(1)
}

function openCreate() { Object.assign(form, blank()); editMode.value = false; showModal.value = true }
function openEdit(p: Patient) {
  const { patient_id, ...rest } = p
  Object.assign(form, rest); editId.value = patient_id; editMode.value = true; showModal.value = true
}
function del(id: string) { if (confirm('Delete this patient?')) store.deletePatient(id) }
function submit() {
  if (editMode.value) store.updatePatient(editId.value, { ...form })
  else                store.addPatient({ ...form })
  showModal.value = false
}
</script>
