<template>
    <div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col">
    <main class="flex-1 flex flex-col items-center justify-center px-6 text-center pb-16">
      

      <h1 class="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
        Medical Laboratory<br>
        <span class="text-accent-400">Management System</span>
      </h1>
      <p class="text-primary-300 text-lg max-w-xl mb-12">
        Streamlined test requests, results, and patient management for your laboratory — all in one place.
      </p>

      <!-- Portal cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        <RouterLink to="/doctor" class="portal-card group">
          <div class="portal-icon bg-blue-100 group-hover:bg-blue-200">🩺</div>
          <h2 class="text-lg font-bold text-gray-900 mt-3">Doctor Portal</h2>
          <p class="text-sm text-gray-500 mt-1">View all Profiles of our beloved Lab Technicians</p>
          <div class="mt-4 btn-primary text-sm justify-center">Enter Portal →</div>
        </RouterLink>


        <RouterLink to="/technician" class="portal-card group">
          <div class="portal-icon bg-green-100 group-hover:bg-green-200">🔬</div>
          <h2 class="text-lg font-bold text-gray-900 mt-3">Technician Portal</h2>
          <p class="text-sm text-gray-500 mt-1">Process test queue, enter results, manage assignments</p>
          <div class="mt-4 btn-secondary text-sm justify-center border-primary-600 text-primary-700 hover:bg-primary-50">Enter Portal →</div>
        </RouterLink>

        <RouterLink to="/adminPatient" class="portal-card group">
          <div class="portal-icon bg-pink-100 group-hover:bg-pink-200">🧑‍⚕️</div>
          <h2 class="text-lg font-bold text-gray-900 mt-3">Patient Portal</h2>
          <p class="text-sm text-gray-500 mt-1">View all Profiles of the Patients</p>
          <div class="mt-4 btn-primary text-sm justify-center bg-pink-500 hover:bg-pink-600 border-0">Enter Portal →</div>
        </RouterLink>
      </div> -->
      <div class="w-full max-w-md mx-4 z-10">
      <!-- Logo / Brand -->
       <div class="text-center mb-8">
        <div class="inline-flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-accent-400 rounded-2xl flex items-center justify-center font-bold text-primary-900 text-2xl shadow-lg">M</div>
          <span class="text-3xl font-bold text-white tracking-tight">MedLab<span class="text-accent-400">System</span></span>
        </div>
        <p class="text-primary-300 text-sm">Medical Laboratory Management</p>
      </div>
    </div>
    </main>
    </div>
</template>

<style scoped>
.portal-card {
  @apply bg-white rounded-2xl p-6 text-left shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 cursor-pointer;
}
.portal-icon {
  @apply w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-colors;
}
</style>