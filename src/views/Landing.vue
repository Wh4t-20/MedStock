<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between px-8 py-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-accent-400 rounded-xl flex items-center justify-center font-bold text-primary-900 text-xl">M</div>
        <span class="text-white text-xl font-bold tracking-tight">MedLab<span class="text-accent-400">System</span></span>
      </div>
      <span class="text-primary-300 text-sm">Medical Laboratory Management</span>
    </header>

    <!-- Hero -->
    <main class="flex-1 flex flex-col items-center justify-center px-6 text-center pb-16">
      

      <h1 class="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
        Medical Laboratory<br>
        <span class="text-accent-400">Management System</span>
      </h1>
      <p class="text-primary-300 text-lg max-w-xl mb-12">
        Streamlined test requests, results, and patient management for your laboratory — all in one place.
      </p>

      <!-- Portal cards -->
      <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <RouterLink to="/doctor" class="portal-card group">
          <div class="portal-icon bg-blue-100 group-hover:bg-blue-200">🩺</div>
          <h2 class="text-lg font-bold text-gray-900 mt-3">Doctor Portal</h2>
          <p class="text-sm text-gray-500 mt-1">Request lab tests, view patient history, manage orders</p>
          <div class="mt-4 btn-primary text-sm justify-center">Enter Portal →</div>
        </RouterLink>

        <RouterLink to="/patient" class="portal-card group">
          <div class="portal-icon bg-yellow-100 group-hover:bg-yellow-200">🧑‍⚕️</div>
          <h2 class="text-lg font-bold text-gray-900 mt-3">Patient Portal</h2>
          <p class="text-sm text-gray-500 mt-1">View your lab requests, results, and medical records</p>
          <div class="mt-4 btn-accent text-sm justify-center">Enter Portal →</div>
        </RouterLink>

        <RouterLink to="/technician" class="portal-card group">
          <div class="portal-icon bg-green-100 group-hover:bg-green-200">🔬</div>
          <h2 class="text-lg font-bold text-gray-900 mt-3">Technician Portal</h2>
          <p class="text-sm text-gray-500 mt-1">Process test queue, enter results, manage assignments</p>
          <div class="mt-4 btn-secondary text-sm justify-center border-primary-600 text-primary-700 hover:bg-primary-50">Enter Portal →</div>
        </RouterLink>
      </div> -->
      <div class="w-full max-w-md mx-4 z-10">
      <!-- Logo / Brand -->
      <!-- <div class="text-center mb-8">
        <div class="inline-flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-accent-400 rounded-2xl flex items-center justify-center font-bold text-primary-900 text-2xl shadow-lg">M</div>
          <span class="text-3xl font-bold text-white tracking-tight">MedLab<span class="text-accent-400">System</span></span>
        </div>
        <p class="text-primary-300 text-sm">Medical Laboratory Management</p>
      </div> 

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h1 class="text-center text-2xl font-bold text-gray-900 mb-1">LOGIN PORTAL</h1>
        <p class="text-center text-gray-400 text-sm mb-6">Sign in to access your portal</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div class="text-left" >
            <label class="form-label text-base mb-1 font-bold">Email</label>
            <input
              type="email"
              v-model="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
              class="form-input"
              align
            />
          </div>

          <!-- Password -->
          <div class = "text-left">
            <label class="form-label text-base font-bold mb-1" >Password</label>
            <input
              type="password"
              v-model="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
              class="form-input"
            />
          </div>

          <!-- Error -->
          <p v-if="errorMessage" class="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-xl py-2 px-3">
            {{ errorMessage }}
          </p>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 mt-2 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-semibold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:-translate-y-px"
          >
            {{ isLoading ? 'Signing in…' : 'Sign In' }}
          </button>

          <!-- Remember me -->
          <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <input id="rememberMe" type="checkbox" v-model="rememberMe" class="accent-primary-600 w-4 h-4" />
            <label for="rememberMe" class="cursor-pointer select-none">Remember Email</label>
          </div>
        </form>

        <!-- Role legend -->
        <div class="mt-6 pt-5 border-t border-gray-100">
          <p class="text-xs text-gray-400 text-center mb-3">You'll be redirected based on your role</p>
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="bg-blue-50 text-blue-700 rounded-xl py-2 px-1 font-medium">🩺 Doctor</div>
            <div class="bg-yellow-50 text-yellow-700 rounded-xl py-2 px-1 font-medium">🧑‍⚕️ Patient</div>
            <div class="bg-green-50 text-green-700 rounded-xl py-2 px-1 font-medium">🔬 Technician</div>
            <div 
              @click="router.push('/crud')" 
              class="bg-purple-50 text-purple-700 rounded-xl py-2 px-1 font-medium cursor-pointer hover:bg-purple-100 transition-colors active:scale-95 select-none"
            >
              ⚙️ Admin
            </div>
          </div>
        </div>
      </div>

      <p class="text-center text-primary-400 text-xs mt-6">
        <a href="#" class="hover:text-accent-400 transition-colors">Data Privacy Act</a>
      </p>
    </div>
    </main>

    <footer class="text-center text-primary-500 text-sm pb-6">
      rararahhhh goated ahhhhh
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'

const router       = useRouter()
const email        = ref('')
const password     = ref('')
const rememberMe   = ref(false)
const errorMessage = ref('')
const isLoading    = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value    = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email:    email.value,
      password: password.value,
    })

    if (error) { errorMessage.value = error.message; return }

    if (data.user) {
      const uid = data.user.id

      // Check which entity this user belongs to
      const [{ data: doctor }, { data: patient }, { data: technician }] = await Promise.all([
        supabase.from('Doctor').select('doctor_id').eq('user_id', uid).maybeSingle(),
        supabase.from('Patient').select('patient_id').eq('user_id', uid).maybeSingle(),
        supabase.from('LabTechnician').select('technician_id').eq('user_id', uid).maybeSingle(),
      ])

      if (doctor)      router.push('/doctor/dashboard')
      else if (patient) router.push('/patient/dashboard')
      else if (technician) router.push('/technician/dashboard')
      else errorMessage.value = 'No role assigned to this account.'
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.portal-card {
  @apply bg-white rounded-2xl p-6 text-left shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 cursor-pointer;
}
.portal-icon {
  @apply w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-colors;
}
</style>
