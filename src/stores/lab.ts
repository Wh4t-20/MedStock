import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  patients as seedPatients,
  doctors as seedDoctors,
  labTechnicians as seedTechnicians,
  testTypes as seedTestTypes,
  labRequests as seedRequests,
  requestDetails as seedDetails,
  testResults as seedResults,
  nextId
} from '@/api/db'
import type {
  Patient, Doctor, LabTechnician, TestType,
  LabRequest, RequestDetail, TestResult, LabRequestView
} from '@/types'

export const useLabStore = defineStore('lab', () => {
  // ─── State ─────────────────────────────────────────────────────────────────
  const patients       = ref<Patient[]>([...seedPatients])
  const doctors        = ref<Doctor[]>([...seedDoctors])
  const technicians    = ref<LabTechnician[]>([...seedTechnicians])
  const testTypes      = ref<TestType[]>([...seedTestTypes])
  const labRequests    = ref<LabRequest[]>([...seedRequests])
  const requestDetails = ref<RequestDetail[]>([...seedDetails])
  const testResults    = ref<TestResult[]>([...seedResults])

  // ─── Computed getters ──────────────────────────────────────────────────────
  const requestViews = computed<LabRequestView[]>(() =>
    labRequests.value.map(req => {
      const patient   = patients.value.find(p => p.patient_id === req.patient_id)!
      const doctor    = doctors.value.find(d => d.doctor_id   === req.doctor_id)!
      const details   = requestDetails.value
        .filter(rd => rd.request_id === req.request_id)
        .map(rd => ({
          ...rd,
          test_type: testTypes.value.find(tt => tt.test_type_id === rd.test_type_id)!
        }))
      const results = testResults.value
        .filter(tr => details.some(d => d.detail_id === tr.detail_id))
        .map(tr => ({
          ...tr,
          technician: technicians.value.find(t => t.technician_id === tr.technician_id)!
        }))
      return { ...req, patient, doctor, details, results }
    })
  )

  // ─── Patient CRUD ──────────────────────────────────────────────────────────
  function addPatient(data: Omit<Patient, 'patient_id'>) {
    patients.value.push({ ...data, patient_id: nextId('P') })
  }
  function updatePatient(id: string, data: Partial<Patient>) {
    const i = patients.value.findIndex(p => p.patient_id === id)
    if (i !== -1) patients.value[i] = { ...patients.value[i], ...data }
  }
  function deletePatient(id: string) {
    patients.value = patients.value.filter(p => p.patient_id !== id)
  }

  // ─── Doctor CRUD ───────────────────────────────────────────────────────────
  function addDoctor(data: Omit<Doctor, 'doctor_id'>) {
    doctors.value.push({ ...data, doctor_id: nextId('D') })
  }
  function updateDoctor(id: string, data: Partial<Doctor>) {
    const i = doctors.value.findIndex(d => d.doctor_id === id)
    if (i !== -1) doctors.value[i] = { ...doctors.value[i], ...data }
  }
  function deleteDoctor(id: string) {
    doctors.value = doctors.value.filter(d => d.doctor_id !== id)
  }

  // ─── Technician CRUD ───────────────────────────────────────────────────────
  function addTechnician(data: Omit<LabTechnician, 'technician_id'>) {
    technicians.value.push({ ...data, technician_id: nextId('T') })
  }
  function updateTechnician(id: string, data: Partial<LabTechnician>) {
    const i = technicians.value.findIndex(t => t.technician_id === id)
    if (i !== -1) technicians.value[i] = { ...technicians.value[i], ...data }
  }
  function deleteTechnician(id: string) {
    technicians.value = technicians.value.filter(t => t.technician_id !== id)
  }

  // ─── TestType CRUD ─────────────────────────────────────────────────────────
  function addTestType(data: Omit<TestType, 'test_type_id'>) {
    testTypes.value.push({ ...data, test_type_id: nextId('TT') })
  }
  function updateTestType(id: string, data: Partial<TestType>) {
    const i = testTypes.value.findIndex(t => t.test_type_id === id)
    if (i !== -1) testTypes.value[i] = { ...testTypes.value[i], ...data }
  }
  function deleteTestType(id: string) {
    testTypes.value = testTypes.value.filter(t => t.test_type_id !== id)
  }

  // ─── LabRequest CRUD ───────────────────────────────────────────────────────
  function addLabRequest(data: Omit<LabRequest, 'request_id'>, detailTestTypeIds: string[]) {
    const req: LabRequest = { ...data, request_id: nextId('LR') }
    labRequests.value.push(req)
    detailTestTypeIds.forEach(ttid => {
      requestDetails.value.push({
        detail_id: nextId('RD'),
        request_id: req.request_id,
        test_type_id: ttid
      })
    })
    return req
  }
  function updateLabRequest(id: string, data: Partial<LabRequest>) {
    const i = labRequests.value.findIndex(r => r.request_id === id)
    if (i !== -1) labRequests.value[i] = { ...labRequests.value[i], ...data }
  }

  // ─── TestResult CRUD ───────────────────────────────────────────────────────
  function addTestResult(data: Omit<TestResult, 'result_id'>) {
    testResults.value.push({ ...data, result_id: nextId('TR') })
  }
  function updateTestResult(id: string, data: Partial<TestResult>) {
    const i = testResults.value.findIndex(r => r.result_id === id)
    if (i !== -1) testResults.value[i] = { ...testResults.value[i], ...data }
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = computed(() => ({
    totalPatients:    patients.value.length,
    totalDoctors:     doctors.value.length,
    totalTechnicians: technicians.value.length,
    pendingRequests:  labRequests.value.filter(r => r.status === 'Pending').length,
    inProgressRequests: labRequests.value.filter(r => r.status === 'In Progress').length,
    completedRequests:  labRequests.value.filter(r => r.status === 'Completed').length,
    totalRequests:    labRequests.value.length,
  }))

  return {
    patients, doctors, technicians, testTypes,
    labRequests, requestDetails, testResults,
    requestViews, stats,
    addPatient, updatePatient, deletePatient,
    addDoctor, updateDoctor, deleteDoctor,
    addTechnician, updateTechnician, deleteTechnician,
    addTestType, updateTestType, deleteTestType,
    addLabRequest, updateLabRequest,
    addTestResult, updateTestResult
  }
})
