<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Doctors</h2>
        <p class="text-gray-500 text-sm mt-0.5">Licensed physician directory</p>
      </div>
      <button @click="openCreate" class="btn-primary">+ Add Doctor</button>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-gray-500 font-medium">Loading doctors...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="d in doctors" :key="d.doctor_id" class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl">🩺</div>
          <span class="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">#{{ d.doctor_id }}</span>
        </div>
        <h3 class="font-semibold text-gray-900">Dr. {{ d.first_name }} {{ d.middle_name }} {{ d.last_name }}</h3>
        <p class="text-sm text-primary-600 font-medium mt-0.5">{{ d.specialization }}</p>
        <div class="mt-3 space-y-1 text-sm text-gray-500">
          <p>📧 {{ d.email }}</p>
          <p>🪪 {{ d.license_number || 'N/A' }}</p>
          <p>📞 {{ d.DoctorContactNumber?.[0]?.dcontact_number || 'N/A' }}</p>
        </div>
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(d)" class="btn-secondary text-xs px-3 py-1.5">Edit</button>
          <button @click="del(d.doctor_id)" class="btn-danger text-xs px-3 py-1.5">Delete</button>
        </div>
      </div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Doctor' : 'Add Doctor'">
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-3 gap-3">
          <div><label class="form-label">First Name</label><input v-model="form.first_name" required class="form-input" /></div>
          <div><label class="form-label">Middle Name</label><input v-model="form.middle_name" class="form-input" /></div>
          <div><label class="form-label">Last Name</label><input v-model="form.last_name" required class="form-input" /></div>
        </div>
        <div><label class="form-label">Specialization</label><input v-model="form.specialization" required class="form-input" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Email</label><input type="email" v-model="form.email" required class="form-input" /></div>
          <div><label class="form-label">License Number</label><input v-model="form.license_number" class="form-input" /></div>
        </div>
        <div><label class="form-label">Contact Number</label><input v-model="form.contact_number" class="form-input" /></div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="isSaving" class="btn-primary">
            {{ isSaving ? 'Saving...' : (editMode ? 'Save' : 'Add Doctor') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import Modal from '@/components/Modal.vue'

const doctors = ref<any[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const showModal = ref(false)
const editMode = ref(false)
const editId = ref<number | null>(null)

const blank = () => ({
  first_name: '', middle_name: '', last_name: '',
  specialization: '', email: '', license_number: '', contact_number: ''
})
const form = reactive({ ...blank() })

async function loadDoctors() {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('Doctor')
      .select('*, DoctorContactNumber(dcontact_number)')
      .order('last_name', { ascending: true })
    if (error) throw error
    doctors.value = data || []
  } catch (err) {
    console.error('Failed to load doctors:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDoctors)

function openCreate() {
  Object.assign(form, blank())
  editMode.value = false
  showModal.value = true
}

function openEdit(d: any) {
  const { doctor_id, DoctorContactNumber, ...rest } = d
  Object.assign(form, {
    ...rest,
    contact_number: DoctorContactNumber?.[0]?.dcontact_number || ''
  })
  editId.value = doctor_id
  editMode.value = true
  showModal.value = true
}

async function del(id: number) {
  if (!confirm('Delete this doctor?')) return
  try {
    const { error } = await supabase.from('Doctor').delete().eq('doctor_id', id)
    if (error) throw error
    await loadDoctors()
  } catch (err) {
    console.error('Failed to delete doctor:', err)
    alert('Failed to delete. Check console.')
  }
}

async function submit() {
  isSaving.value = true
  try {
    const { contact_number, ...doctorFields } = form

    if (editMode.value && editId.value !== null) {
      const { error } = await supabase
        .from('Doctor')
        .update(doctorFields)
        .eq('doctor_id', editId.value)
      if (error) throw error

      if (contact_number) {
        await supabase.from('DoctorContactNumber').upsert({
          doctor_id: editId.value,
          dcontact_number: contact_number
        })
      }
    } else {
      const { data: newDoc, error: insertErr } = await supabase
        .from('Doctor')
        .insert(doctorFields)
        .select()
        .single()
      if (insertErr) throw insertErr

      if (contact_number && newDoc) {
        await supabase.from('DoctorContactNumber').insert({
          doctor_id: newDoc.doctor_id,
          dcontact_number: contact_number
        })
      }
    }

    showModal.value = false
    await loadDoctors()
  } catch (err) {
    console.error('Save failed:', err)
    alert('Failed to save doctor. Check console.')
  } finally {
    isSaving.value = false
  }
}
</script>
