<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div><h2 class="text-2xl font-bold font-mono text-[#18265F]">Test Types</h2><p class="text-gray-500 text-sm mt-0.5">Centralized laboratory test catalog</p></div>
      <button @click="openCreate" class="btn-primary">+ Add Test Type</button>
    </div>

    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
      ⚠️ {{ errorMsg }}
    </div>

    <div v-if="isLoading" class="text-center py-10 text-gray-500 font-medium">Loading test types...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="tt in testTypes" :key="tt.test_type_id" class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <span class="text-3xl">🔬</span>
          <span class="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{{ tt.test_type_id }}</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900">{{ tt.test_name }}</h3>
        <span class="inline-block mt-1 bg-accent-100 text-accent-800 text-xs px-2 py-0.5 rounded-full font-medium">{{ tt.category }}</span>
        <p class="text-sm text-gray-500 mt-3">{{ tt.description }}</p>
        <div class="mt-3 p-3 bg-gray-50 rounded-xl">
          <p class="text-xs font-semibold text-gray-600 mb-1">Normal Range</p>
          <p class="text-xs text-gray-500">{{ tt.normal_range }}</p>
        </div>
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(tt)" class="btn-secondary text-xs px-3 py-1.5">Edit</button>
          <button @click="del(tt.test_type_id)" class="btn-danger text-xs px-3 py-1.5">Delete</button>
        </div>
      </div>
      <div v-if="!testTypes.length && !isLoading" class="col-span-3 card p-12 text-center text-gray-400">No test types found.</div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Test Type' : 'Add Test Type'">
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Test Name</label><input v-model="form.test_name" required class="form-input" /></div>
          <div><label class="form-label">Category</label><input v-model="form.category" required class="form-input" /></div>
        </div>
        <div><label class="form-label">Description</label><textarea v-model="form.description" class="form-input h-20 resize-none" required></textarea></div>
        <div><label class="form-label">Normal Range</label><textarea v-model="form.normal_range" class="form-input h-20 resize-none" required></textarea></div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="isSaving" class="btn-primary">
            {{ isSaving ? 'Saving...' : (editMode ? 'Save' : 'Add Test Type') }}
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

const testTypes = ref<any[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const showModal = ref(false)
const editMode = ref(false)
const editId = ref<number | null>(null)
const errorMsg = ref('')

const blank = () => ({ test_name: '', category: '', description: '', normal_range: '' })
const form = reactive({ ...blank() })

async function loadTestTypes() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const { data, error } = await supabase
      .from('TestType')
      .select('*')
      .order('test_name', { ascending: true })
    if (error) throw error
    testTypes.value = data || []
  } catch (err: any) {
    errorMsg.value = `Failed to load test types: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTestTypes)

function openCreate() {
  Object.assign(form, blank())
  editMode.value = false
  showModal.value = true
}

function openEdit(tt: any) {
  Object.assign(form, {
    test_name:    tt.test_name,
    category:     tt.category,
    description:  tt.description,
    normal_range: tt.normal_range,
  })
  editId.value = tt.test_type_id
  editMode.value = true
  showModal.value = true
}

async function del(id: number) {
  if (!confirm('Delete this test type?')) return
  try {
    const { error } = await supabase.from('TestType').delete().eq('test_type_id', id)
    if (error) throw error
    await loadTestTypes()
  } catch (err: any) {
    errorMsg.value = `Delete failed: ${err.message}`
  }
}

async function submit() {
  isSaving.value = true
  errorMsg.value = ''
  try {
    if (editMode.value && editId.value !== null) {
      const { error } = await supabase
        .from('TestType')
        .update({ ...form })
        .eq('test_type_id', editId.value)
      if (error) throw error
    } else {
      const { error } = await supabase.from('TestType').insert({ ...form })
      if (error) throw error
    }
    showModal.value = false
    await loadTestTypes()
  } catch (err: any) {
    errorMsg.value = `Save failed: ${err.message}`
  } finally {
    isSaving.value = false
  }
}
</script>
