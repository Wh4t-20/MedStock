<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-mono font-bold text-[#18265F]">Lab Technicians</h2>
        <p class="text-gray-500 text-sm mt-0.5">Registered laboratory staff</p>
      </div>
      <button @click="openCreate" class="btn-primary">+ Add Technician</button>
    </div>

    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
      ⚠️ {{ errorMsg }}
    </div>

    <div v-if="loading" class="card p-8 text-center text-gray-400">Loading...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="t in technicians" :key="t.technician_id" class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">🔬</div>
          <span class="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{{ t.technician_id }}</span>
        </div>
        <h3 class="font-semibold text-gray-900">{{ t.first_name }} {{ t.last_name }}</h3>
        <p class="text-xs text-green-700 font-medium mt-0.5 bg-green-50 inline-block px-2 py-0.5 rounded-full">{{ t.license_number }}</p>
        <div class="mt-3 space-y-1 text-sm text-gray-500">
          <p>📧 {{ t.email }}</p>
          <p>📊 {{ t.resultCount ?? 0 }} result(s) recorded</p>
        </div>
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(t)" class="btn-secondary text-xs px-3 py-1.5">Edit</button>
          <button @click="del(t.technician_id)" class="btn-danger text-xs px-3 py-1.5">Delete</button>
        </div>
      </div>
      <div v-if="!technicians.length" class="col-span-3 card p-12 text-center text-gray-400">
        No technicians found.
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
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="submitting" class="btn-primary">
            {{ submitting ? 'Saving…' : editMode ? 'Save' : 'Add Technician' }}
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

const technicians = ref<any[]>([])
const loading     = ref(true)
const submitting  = ref(false)
const showModal   = ref(false)
const editMode    = ref(false)
const editId      = ref<number | null>(null)
const errorMsg    = ref('')

const blank = () => ({ first_name: '', last_name: '', email: '', license_number: '' })
const form  = reactive({ ...blank() })

async function fetchTechnicians() {
  errorMsg.value = ''
  // Simple fetch — no nested relations to avoid FK config issues
  const { data: techs, error: techError } = await supabase
    .from('LabTechnician')
    .select('*')
    .order('last_name', { ascending: true })

  if (techError) { errorMsg.value = `Failed to load technicians: ${techError.message}`; return }

  // Separately fetch result counts
  const { data: results } = await supabase
    .from('TestResult')
    .select('technician_id')

  const countMap: Record<number, number> = {}
  for (const r of results ?? []) {
    countMap[r.technician_id] = (countMap[r.technician_id] ?? 0) + 1
  }

  technicians.value = (techs ?? []).map(t => ({
    ...t,
    resultCount: countMap[t.technician_id] ?? 0
  }))
}

onMounted(async () => {
  try { await fetchTechnicians() }
  catch (e: any) { errorMsg.value = e.message }
  finally { loading.value = false }
})

function openCreate() {
  Object.assign(form, blank())
  editMode.value  = false
  showModal.value = true
}

function openEdit(t: any) {
  Object.assign(form, {
    first_name:     t.first_name,
    last_name:      t.last_name,
    email:          t.email,
    license_number: t.license_number,
  })
  editId.value    = t.technician_id
  editMode.value  = true
  showModal.value = true
}

async function del(id: number) {
  if (!confirm('Delete this technician?')) return
  const { error } = await supabase.from('LabTechnician').delete().eq('technician_id', id)
  if (error) { errorMsg.value = `Delete failed: ${error.message}`; return }
  await fetchTechnicians()
}

async function submit() {
  submitting.value = true
  errorMsg.value   = ''
  try {
    if (editMode.value) {
      const { error } = await supabase.from('LabTechnician').update({ ...form }).eq('technician_id', editId.value)
      if (error) throw error
    } else {
      const { error } = await supabase.from('LabTechnician').insert({ ...form })
      if (error) throw error
    }
    showModal.value = false
    await fetchTechnicians()
  } catch (e: any) {
    errorMsg.value = `Save failed: ${e.message}`
  } finally {
    submitting.value = false
  }
}
</script>
