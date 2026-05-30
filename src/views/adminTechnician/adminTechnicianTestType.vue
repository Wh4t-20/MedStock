<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold font-mono text-[#18265F]">Test Types</h2>
        <p class="text-gray-500 text-sm mt-0.5">Centralized laboratory test catalog</p>
      </div>
      <button @click="openCreate" class="btn-primary">+ Add Test Type</button>
    </div>

    <div v-if="isLoading" class="text-center py-12 text-gray-500 font-medium">
      Loading test catalog...
    </div>

    <div v-else-if="testTypes.length === 0" class="text-center py-12 text-gray-500 font-medium">
      No test types found. Create one to get started!
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="tt in testTypes" :key="tt.test_type_id" class="card p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
        
        <div class="flex items-start justify-between mb-3">
          <span class="text-3xl">🔬</span>
          <span class="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
            #{{ tt.test_type_id }}
          </span>
        </div>
        
        <h3 class="text-lg font-bold text-gray-900">{{ tt.test_name }}</h3>
        <span class="inline-block mt-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2 py-0.5 rounded-full font-medium">
          {{ tt.category }}
        </span>
        
        <p class="text-sm text-gray-500 mt-3 line-clamp-2" :title="tt.description">
          {{ tt.description }}
        </p>
        
        <div class="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p class="text-xs font-bold text-gray-700 mb-1">Normal Range</p>
          <p class="text-xs text-gray-600 font-mono">{{ tt.normal_range || 'Not specified' }}</p>
        </div>
        
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(tt)" class="btn-secondary text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">Edit</button>
          <button @click="del(tt.test_type_id)" class="btn-danger text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 transition-colors">Delete</button>
        </div>
        
      </div>
    </div>

    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="editMode ? 'Edit Test Type' : 'Add Test Type'">
      <form @submit.prevent="submit" class="space-y-4">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Test Name</label>
            <input v-model="form.test_name" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g., Complete Blood Count" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <input v-model="form.category" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g., Hematology" />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <textarea v-model="form.description" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none" required placeholder="What does this test measure?"></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Normal Range</label>
          <textarea v-model="form.normal_range" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-16 resize-none" required placeholder="e.g., 4.5 - 5.5 million cells/mcL"></textarea>
        </div>
        
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
          <button type="button" @click="showModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors">
            {{ isSaving ? 'Saving...' : (editMode ? 'Save Changes' : 'Add Test Type') }}
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

// --- State ---
const testTypes = ref<any[]>([])
const isLoading = ref(true)
const isSaving  = ref(false)

// Modal & Form State
const showModal = ref(false)
const editMode  = ref(false)
const editId    = ref('')

const blank = () => ({ test_name: '', category: '', description: '', normal_range: '' })
const form = reactive({ ...blank() })

// --- Database Operations ---

// 1. Fetch
const fetchTestTypes = async () => {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from('TestType')
      .select('*')
      .order('category', { ascending: true }) // Group by category alphabetically
      .order('test_name', { ascending: true })
      
    if (error) throw error
    testTypes.value = data || []
  } catch (error) {
    console.error("Error fetching test types:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTestTypes()
})

// --- Form Handlers ---

function openCreate() { 
  Object.assign(form, blank())
  editMode.value = false
  showModal.value = true 
}

function openEdit(tt: any) { 
  Object.assign(form, {
    test_name: tt.test_name,
    category: tt.category,
    description: tt.description,
    normal_range: tt.normal_range
  })
  editId.value = tt.test_type_id
  editMode.value = true
  showModal.value = true 
}

async function submit() { 
  isSaving.value = true
  try {
    if (editMode.value) {
      // Update existing record
      const { error } = await supabase
        .from('TestType')
        .update({ ...form })
        .eq('test_type_id', editId.value)
        
      if (error) throw error
    } else {
      // Create new record
      const { error } = await supabase
        .from('TestType')
        .insert([{ ...form }])
        
      if (error) throw error
    }
    
    showModal.value = false
    await fetchTestTypes() 
    
  } catch (error) {
    console.error("Failed to save test type:", error)
    alert("An error occurred while saving. Check console.")
  } finally {
    isSaving.value = false
  }
}

// 3. Delete
async function del(id: string) { 
  if (!confirm('Are you sure you want to permanently delete this test type?')) return
  
  try {
    const { error } = await supabase
      .from('TestType')
      .delete()
      .eq('test_type_id', id)
      
    if (error) throw error
    
    await fetchTestTypes() 
  } catch (error) {
    console.error("Failed to delete:", error)
    alert("Cannot delete this test type. It is likely being used in existing Lab Requests.")
  }
}
</script>