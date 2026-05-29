<template>
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-2xl font-bold font-mono text-[#18265F]">Doctors</h2><p class="text-gray-500 text-sm mt-0.5">Licensed Physician Directory</p></div>
        <button @click="openCreate" class="btn-primary">+ Add Doctor</button>
      </div>
      <input v-model="search" placeholder="Search by name, email, speacialization…" class="form-input max-w-sm" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="d in store.doctors":key="d.doctor_id" class="card p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl">🩺</div>
            <span class="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{{ d.doctor_id }}</span>
          </div>
          <h3 class="font-semibold text-gray-900">Dr. {{ d.first_name }} {{ d.last_name }}</h3>
          <p class="text-sm text-primary-600 font-medium mt-0.5">{{ d.specialization }}</p>
          <div class="mt-3 space-y-1 text-sm text-gray-500">
            <p>📧 {{ d.email }}</p>
            <p>📞 {{ d.contact_number }}</p>
          </div>
          <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
            <button @click="openEdit(d)" class="btn-secondary text-xs px-3 py-1.5">Edit</button>
            <button @click="del(d.doctor_id)" class="btn-danger text-xs px-3 py-1.5">Delete</button>
          </div>
        </div>
      </div>
  
      <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Doctor' : 'Add Doctor'">
        <form @submit.prevent="submit" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div><label class="form-label">First Name</label><input v-model="form.first_name" required class="form-input" /></div>
            <div><label class="form-label">Middle Name</label><input v-model="form.last_name" required class="form-input" /></div>
            <div><label class="form-label">Last Name</label><input v-model="form.last_name" required class="form-input" /></div>
          </div>
          <div><label class="form-label">Specialization</label><input v-model="form.specialization" required class="form-input" /></div>
          <div><label class="form-label">License Number</label><input v-model="form.specialization" required class="form-input" placeholder="MLS-YYYY-XXXXXX" /></div>
          <div><label class="form-label">Email</label><input type="email" v-model="form.email" required class="form-input" /></div>
          <div><label class="form-label">Contact Number</label><input v-model="form.contact_number" required class="form-input" /></div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">{{ editMode ? 'Save' : 'Add Doctor' }}</button>
          </div>
        </form>
      </Modal>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { useLabStore } from '@/stores/lab'
  import type { Doctor } from '@/types'
  import Modal from '@/components/Modal.vue'
  const search = ref('')
  const store = useLabStore()
  const showModal = ref(false); const editMode = ref(false); const editId = ref('')
  const blank = (): Omit<Doctor,'doctor_id'> => ({ first_name:'', last_name:'', email:'', contact_number:'', specialization:'' })
  const form = reactive<Omit<Doctor,'doctor_id'>>({ ...blank() })
  
  function openCreate() { Object.assign(form, blank()); editMode.value = false; showModal.value = true }
  function openEdit(d: Doctor) { const { doctor_id, ...rest } = d; Object.assign(form, rest); editId.value = doctor_id; editMode.value = true; showModal.value = true }
  function del(id: string) { if (confirm('Delete this doctor?')) store.deleteDoctor(id) }
  function submit() { if (editMode.value) store.updateDoctor(editId.value, { ...form }); else store.addDoctor({ ...form }); showModal.value = false }
  </script>
  