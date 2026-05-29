<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col">
    <header class="flex items-center justify-between px-8 py-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-accent-400 rounded-xl flex items-center justify-center font-bold text-primary-900 text-xl">M</div>
        <span class="text-white text-xl font-bold tracking-tight">MedLab<span class="text-accent-400">System</span></span>
      </div>
      <span class="text-primary-300 text-sm">Medical Laboratory Management</span>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center px-6 text-center pb-16">
      

      <h1 class="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
        Medical Laboratory<br>
        <span class="text-accent-400">Management System</span>
      </h1>
      <p class="text-primary-300 text-lg max-w-xl mb-12">
        Streamlined test requests, results, and patient management for your laboratory — all in one place.
      </p>

      <div class="w-full max-w-md mx-4 z-10">
      
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h1 class="text-center text-2xl font-bold text-gray-900 mb-1">LOGIN PORTAL</h1>
        <p class="text-center text-gray-400 text-sm mb-6">Sign in to access your portal</p>

        <form v-if="step === 1" @submit.prevent="sendOtp" class="space-y-4">
          <div class="text-left" >
            <label class="form-label text-base mb-1 font-bold">Email</label>
            <input
              type="email"
              v-model="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
              class="form-input w-full"
            />
          </div>

          <p v-if="errorMessage" class="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-xl py-2 px-3">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 mt-2 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-semibold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:-translate-y-px"
          >
            {{ isLoading ? 'Sending Code…' : 'Send Login Code' }}
          </button>

          <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <input id="rememberMe" type="checkbox" v-model="rememberMe" class="accent-primary-600 w-4 h-4" />
            <label for="rememberMe" class="cursor-pointer select-none">Remember Email</label>
          </div>
        </form>

        <form v-else @submit.prevent="verifyOtp" class="space-y-4">
          <div class="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg mb-2 text-center">
            Code sent to <br><b>{{ email }}</b>
          </div>

          <div class="text-left">
            <label class="form-label text-base font-bold mb-1">8-Digit Code</label>
            <input
              type="text"
              v-model="otp"
              placeholder="12345678"
              maxlength="8"
              required
              class="form-input w-full text-center tracking-widest text-lg font-mono"
            />
          </div>

          <p v-if="errorMessage" class="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-xl py-2 px-3">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 mt-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:-translate-y-px"
          >
            {{ isLoading ? 'Verifying…' : 'Verify & Sign In' }}
          </button>

          <div class="text-center mt-2">
            <button @click="step = 1; errorMessage = ''" type="button" class="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
              ← Use a different email
            </button>
          </div>
        </form>

        <div class="mt-6 pt-5 border-t border-gray-100">
          <p class="text-xs text-gray-400 text-center mb-3">You'll be redirected based on your role</p>
          <div class="grid grid-cols-2 gap-2 text-center text-xs">
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
import { ref, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'

const router       = useRouter()
const email        = ref('')
const otp          = ref('') 
const step         = ref(1)  
const rememberMe   = ref(false)
const errorMessage = ref('')
const isLoading    = ref(false)

// Send the OTP code
const sendOtp = async () => {
  errorMessage.value = ''
  isLoading.value    = true

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        // be true so our VIP Database Trigger can run!
        shouldCreateUser: true 
      }
    })

    if (error) { 
      errorMessage.value = error.message; 
      return 
    }

    step.value = 2

  } catch {
    errorMessage.value = 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await supabase.auth.signOut()
})

const verifyOtp = async () => {
  errorMessage.value = ''
  isLoading.value    = true

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.value,
      token: otp.value,
      type: 'email'
    })

    if (error) { 
      errorMessage.value = error.message; 
      return 
    }

    if (data.user) {
      const uid = data.user.id

      const [{ data: doctor }, { data: patient }, { data: technician }, { data: admin }] = await Promise.all([
        supabase.from('Doctor').select('doctor_id').eq('user_id', uid).maybeSingle(),
        supabase.from('Patient').select('patients_id').eq('user_id', uid).maybeSingle(),
        supabase.from('LabTechnician').select('technician_id').eq('user_id', uid).maybeSingle(),
        supabase.from('Admin').select('admin_id').eq('user_id', uid).maybeSingle(),
      ])

      
      if (doctor)          router.push('/doctor/dashboard')
      else if (patient)    router.push('/patient/dashboard')
      else if (technician) router.push('/technician/dashboard')
      else if (admin)      router.push('/crud')
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