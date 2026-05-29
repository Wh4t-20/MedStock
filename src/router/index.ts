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

// supabase stuffs 

// import { supabase } from '@/api/supabase'


import CrudPage   from '@/views/crudPage.vue'
// Admin Portal
//import AddPatient from '@/views/admin/addPatient.vue'
//import ViewPatient from '@/views/adminPatient/viewPatient.vue'
import DoctorsList from '@/views/adminDoctor/AdminDoctor.vue'
import AdminDoctorLayout from '@/views/adminDoctor/AdminDoctorLayout.vue'
import AdminDoctorDashboard from '@/views/adminDoctor/AdminDoctorDashboard.vue'

// import ViewPatient from '@/views/admin/viewPatient.vue'
import AdminPatientLayout from '@/views/adminPatient/adminPatientLayout.vue'
import AdminPatientDashboard from '@/views/adminPatient/adminPatientDashboard.vue'
import adminViewPatient from '@/views/adminPatient/adminViewPatient.vue'

//admin Technician
import TechnicianList from '@/views/adminTechnician/adminTechnician.vue'
import AdminTechnicianLayout from '@/views/adminTechnician/adminTechnicianLayout.vue'
import AdminTechnicianDashboard from '@/views/adminTechnician/adminTechnicianDashboard.vue'
import AdminTechnicianTestType from '@/views/adminTechnician/adminTechnicianTestType.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Landing },

    // Doctor portal
    {
      path: '/doctor',
      component: DoctorLayout,
      // meta: { requiresAuth: true },
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
      // meta: { requiresAuth: true },
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
      // meta: { requiresAuth: true },
      children: [
        { path: '',           redirect: '/technician/dashboard' },
        { path: 'dashboard',  component: TechnicianDashboard,  name: 'tech-dashboard' },
        { path: 'queue',      component: TechnicianQueue,      name: 'tech-queue'     },
        { path: 'results',    component: TechnicianResults,    name: 'tech-results'   },
        { path: 'directory',  component: TechnicianDirectory,  name: 'tech-directory' },
      ]
    },

    {
      path: '/admin-doctor',
      component: AdminDoctorLayout,
      // meta: { requiresAuth: true },
      children: [
        { path: '',           redirect: '/admin-doctor/dashboard' },
        { path: 'dashboard',  component: AdminDoctorDashboard,  name: 'aDoctor-dashboard' },
        { path: 'doctors',      component: DoctorsList,      name: 'aDoctor-list'     },
        ]
      },
    {
      path: '/admin-patient',
      component: AdminPatientLayout,
      // meta: { requiresAuth: true },
      children: [
        { path: '',           redirect: '/admin-patient/dashboard' },
        { path: 'dashboard',  component: AdminPatientDashboard,  name: 'aPatient-dashboard' },
        { path: 'patients',    component: adminViewPatient,    name: 'aPatient-view'   },
      ]
    },
    {
      path: '/admin-technician',
      component: AdminTechnicianLayout,
      // meta: { requiresAuth: true },
      children: [
        { path: '',           redirect: '/admin-technician/dashboard' },
        { path: 'dashboard',  component: AdminTechnicianDashboard,  name: 'aTechnician-dashboard' },
        { path: 'technicians',    component: TechnicianList,    name: 'aTechnician-view'   },
        { path: 'testype', component: AdminTechnicianTestType, name: 'aTechnician-testtype'}
      ]
    },
    { 
      path: '/crud',             
      component: CrudPage,   
      // meta: { requiresAuth: true },
      name: 'crud-home' 
    },
   
   // { 
     // path: '/adminPatient/addPatient',             
      //component: AddPatient,   
      //meta: { requiresAuth: true },
     // name: 'add-patient' 
    //},
  ]
})
//basically protection para di maablihan gamit searchbar
// router.beforeEach(async (to, _from, next) => {
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

//   if (!requiresAuth) {
//     next()
//     return
//   }

//   const { data: { session } } = await supabase.auth.getSession()

//   if (!session) {
//     next('/')
//   } else {
//     next()
//   }
// })

//Basically checks if you have permission from supabase based on you role
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
