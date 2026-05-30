<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Doctors</h2>
        <p class="text-gray-500 text-sm mt-0.5">Licensed physician directory</p>
      </div>
      <button @click="openCreate" class="btn-primary">+ Add Doctor</button>
    </div>

    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
      ⚠️ {{ errorMsg }}
    </div>

    <div v-if="loading" class="card p-8 text-center text-gray-400">Loading...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="d in doctors" :key="d.doctor_id" class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl">🩺</div>
          <span class="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{{ d.doctor_id }}</span>
        </div>
        <h3 class="font-semibold text-gray-900">Dr. {{ d.first_name }} {{ d.last_name }}</h3>
        <p class="text-sm text-primary-600 font-medium mt-0.5">{{ d.specialization }}</p>
        <div class="mt-3 space-y-1 text-sm text-gray-500">
          <p>📧 {{ d.email }}</p>
          <p>🪪 {{ d.license_number }}</p>
        </div>
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(d)" class="btn-secondary text-xs px-3 py-1.5">Edit</button>
          <button @click="del(d.doctor_id)" class="btn-danger text-xs px-3 py-1.5">Delete</button>
        </div>
      </div>
      <div v-if="!doctors.length" class="col-span-3 card p-12 text-center text-gray-400">No doctors found.</div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Doctor' : 'Add Doctor'">
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">First Name</label><input v-model="form.first_name" required class="form-input" /></div>
          <div><label class="form-label">Last Name</label><input v-model="form.last_name" required class="form-input" /></div>
        </div>
        <div><label class="form-label">Specialization</label><input v-model="form.specialization" required class="form-input" /></div>
        <div><label class="form-label">Email</label><input type="email" v-model="form.email" required class="form-input" /></div>
        <div><label class="form-label">License Number</label><input v-model="form.license_number" required class="form-input" /></div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="submitting" class="btn-primary">
            {{ submitting ? 'Saving…' : editMode ? 'Save' : 'Add Doctor' }}
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

const doctors    = ref<any[]>([])
const loading    = ref(true)
const submitting = ref(false)
const showModal  = ref(false)
const editMode   = ref(false)
const editId     = ref<number | null>(null)
const errorMsg   = ref('')

const blank = () => ({ first_name: '', last_name: '', specialization: '', email: '', license_number: '' })
const form  = reactive({ ...blank() })

async function fetchDoctors() {
  errorMsg.value = ''
  const { data, error } = await supabase
    .from('Doctor')
    .select('*')
    .order('last_name', { ascending: true })
  if (error) { errorMsg.value = `Failed to load: ${error.message}`; return }
  doctors.value = data ?? []
}

onMounted(async () => {
  try { await fetchDoctors() }
  catch (e: any) { errorMsg.value = e.message }
  finally { loading.value = false }
})

function openCreate() {
  Object.assign(form, blank())
  editMode.value  = false
  showModal.value = true
}

function openEdit(d: any) {
  Object.assign(form, {
    first_name:     d.first_name,
    last_name:      d.last_name,
    specialization: d.specialization,
    email:          d.email,
    license_number: d.license_number,
  })
  editId.value    = d.doctor_id
  editMode.value  = true
  showModal.value = true
}

async function del(id: number) {
  if (!confirm('Delete this doctor?')) return
  const { error } = await supabase.from('Doctor').delete().eq('doctor_id', id)
  if (error) { errorMsg.value = `Delete failed: ${error.message}`; return }
  await fetchDoctors()
}

async function submit() {
  submitting.value = true
  errorMsg.value   = ''
  try {
    if (editMode.value) {
      const { error } = await supabase.from('Doctor').update({ ...form }).eq('doctor_id', editId.value)
      if (error) throw error
    } else {
      const { error } = await supabase.from('Doctor').insert({ ...form })
      if (error) throw error
    }
    showModal.value = false
    await fetchDoctors()
  } catch (e: any) {
    errorMsg.value = `Save failed: ${e.message}`
  } finally {
    submitting.value = false
  }
}
</script>
