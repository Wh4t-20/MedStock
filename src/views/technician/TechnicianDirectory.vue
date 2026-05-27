<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div><h2 class="text-2xl font-mono font-bold text-[#18265F]">Lab Technicians</h2><p class="text-gray-500 text-sm mt-0.5">Registered laboratory staff</p></div>
      <button @click="openCreate" class="btn-primary">+ Add Technician</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="t in store.technicians" :key="t.technician_id" class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">🔬</div>
          <span class="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{{ t.technician_id }}</span>
        </div>
        <h3 class="font-semibold text-gray-900">{{ t.first_name }} {{ t.last_name }}</h3>
        <p class="text-xs text-green-700 font-medium mt-0.5 bg-green-50 inline-block px-2 py-0.5 rounded-full">{{ t.license_number }}</p>
        <div class="mt-3 space-y-1 text-sm text-gray-500">
          <p>📧 {{ t.email }}</p>
          <p>📞 {{ t.contact_number }}</p>
          <p>📊 {{ resultCount(t.technician_id) }} result(s) recorded</p>
        </div>
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(t)" class="btn-secondary text-xs px-3 py-1.5">Edit</button>
          <button @click="del(t.technician_id)" class="btn-danger text-xs px-3 py-1.5">Delete</button>
        </div>
      </div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Technician' : 'Add Technician'">
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">First Name</label><input v-model="form.first_name" required class="form-input" /></div>
          <div><label class="form-label">Last Name</label><input v-model="form.last_name" required class="form-input" /></div>
        </div>
        <div><label class="form-label">License Number</label><input v-model="form.license_number" required class="form-input" placeholder="MLS-YYYY-XXXXXX" /></div>
        <div><label class="form-label">Email</label><input type="email" v-model="form.email" required class="form-input" /></div>
        <div><label class="form-label">Contact Number</label><input v-model="form.contact_number" required class="form-input" /></div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">{{ editMode ? 'Save' : 'Add Technician' }}</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useLabStore } from '@/stores/lab'
import type { LabTechnician } from '@/types'
import Modal from '@/components/Modal.vue'

const store = useLabStore()
const showModal = ref(false); const editMode = ref(false); const editId = ref('')
const blank = (): Omit<LabTechnician,'technician_id'> => ({ first_name:'', last_name:'', email:'', contact_number:'', license_number:'' })
const form  = reactive<Omit<LabTechnician,'technician_id'>>({ ...blank() })

function resultCount(tid: string) { return store.testResults.filter(r => r.technician_id === tid).length }
function openCreate() { Object.assign(form, blank()); editMode.value = false; showModal.value = true }
function openEdit(t: LabTechnician) { const { technician_id, ...rest } = t; Object.assign(form, rest); editId.value = technician_id; editMode.value = true; showModal.value = true }
function del(id: string) { if (confirm('Delete this technician?')) store.deleteTechnician(id) }
function submit() { if (editMode.value) store.updateTechnician(editId.value, { ...form }); else store.addTechnician({ ...form }); showModal.value = false }
</script>
