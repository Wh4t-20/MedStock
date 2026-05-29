import { createRouter, createWebHistory } from 'vue-router'

// Landing
import Landing from '@/views/Landing.vue'

// Doctor portal
import DoctorLayout    from '@/views/doctor/DoctorLayout.vue'
import DoctorDashboard from '@/views/doctor/DoctorDashboard.vue'
import DoctorRequests  from '@/views/doctor/DoctorRequests.vue'
import DoctorPatients  from '@/views/doctor/DoctorPatients.vue'
import DoctorDirectory from '@/views/doctor/DoctorDirectory.vue'
import DoctorTestTypes from '@/views/doctor/DoctorTestTypes.vue'

// Patient portal
import PatientLayout   from '@/views/patient/PatientLayout.vue'
import PatientDashboard from '@/views/patient/PatientDashboard.vue'
import PatientRequests  from '@/views/patient/PatientRequests.vue'
import PatientDirectory from '@/views/patient/PatientDirectory.vue'

// Technician portal
import TechnicianLayout    from '@/views/technician/TechnicianLayout.vue'
import TechnicianDashboard from '@/views/technician/TechnicianDashboard.vue'
import TechnicianQueue     from '@/views/technician/TechnicianQueue.vue'
import TechnicianResults   from '@/views/technician/TechnicianResults.vue'
import TechnicianDirectory from '@/views/technician/TechnicianDirectory.vue'

import CrudPage   from '@/views/crudPage.vue'
import AddPatient from '@/views/admin/addPatient.vue'
import { supabase } from '@/api/supabase'



const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Landing },

    // Doctor portal
    {
      path: '/doctor',
      component: DoctorLayout,
      children: [
        { path: '',          redirect: '/doctor/dashboard' },
        { path: 'dashboard', component: DoctorDashboard,  name: 'doctor-dashboard' },
        { path: 'requests',  component: DoctorRequests,   name: 'doctor-requests'  },
        { path: 'patients',  component: DoctorPatients,   name: 'doctor-patients'  },
        { path: 'doctors',   component: DoctorDirectory,  name: 'doctor-directory' },
        { path: 'test-types',component: DoctorTestTypes,  name: 'doctor-test-types'},
      ]
    },

    // Patient portal
    {
      path: '/patient',
      component: PatientLayout,
      children: [
        { path: '',           redirect: '/patient/dashboard' },
        { path: 'dashboard',  component: PatientDashboard,  name: 'patient-dashboard' },
        { path: 'requests',   component: PatientRequests,   name: 'patient-requests'  },
        { path: 'directory',  component: PatientDirectory,  name: 'patient-directory' },
      ]
    },

    // Technician portal
    {
      path: '/technician',
      component: TechnicianLayout,
      children: [
        { path: '',           redirect: '/technician/dashboard' },
        { path: 'dashboard',  component: TechnicianDashboard,  name: 'tech-dashboard' },
        { path: 'queue',      component: TechnicianQueue,      name: 'tech-queue'     },
        { path: 'results',    component: TechnicianResults,    name: 'tech-results'   },
        { path: 'directory',  component: TechnicianDirectory,  name: 'tech-directory' },
      ]
    },
    { 
      path: '/crud',             
      component: CrudPage,   
      name: 'crud-home' 
    },
    { 
      path: '/crud/add-patient', 
      component: AddPatient, 
      name: 'add-patient' 
    }
  ]
})

// Basically checks if you have permission from supabase based on you role
router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return next('/')
    }

    const requiredRole = to.meta.role
    const userRole = sessionStorage.getItem('userRole')

    if (requiredRole && userRole !== requiredRole) {
      console.warn(`Access Denied: ${userRole} attempted to access ${requiredRole} route.`)
      
      if (userRole === 'admin') return next('/crud')
      if (userRole === 'patient') return next('/patient')
      if (userRole === 'doctor') return next('/doctor')
      if (userRole === 'technician') return next('/technician')
      
      return next('/')
    }
  }

  next()
})

export default router
