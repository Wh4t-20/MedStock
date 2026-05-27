// ─── Normalized Entities ──────────────────────────────────────────────────────

export interface Patient {
  patient_id: string
  first_name: string
  middle_name: string
  last_name: string
  date_of_birth: string   // ISO date string
  sex: 'Male' | 'Female' | 'Other'
  email: string
  contact_number: string
  address: string
  height: number          // cm
  weight: number          // kg
}

export interface Doctor {
  doctor_id: string
  first_name: string
  last_name: string
  email: string
  contact_number: string
  specialization: string
}

export interface LabTechnician {
  technician_id: string
  first_name: string
  last_name: string
  email: string
  contact_number: string
  license_number: string
}

export interface TestType {
  test_type_id: string
  test_name: string
  category: string
  description: string
  normal_range: string
}

export interface LabRequest {
  request_id: string
  patient_id: string
  doctor_id: string
  request_date: string    // ISO datetime
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  notes: string
}

export interface RequestDetail {
  detail_id: string
  request_id: string
  test_type_id: string
}

export interface TestResult {
  result_id: string
  detail_id: string       // FK → RequestDetail
  technician_id: string   // FK → LabTechnician
  result_value: string
  result_date: string     // ISO datetime
  remarks: string
}

// ─── View-model helpers (joined data for display) ────────────────────────────

export interface LabRequestView extends LabRequest {
  patient: Patient
  doctor: Doctor
  details: (RequestDetail & { test_type: TestType })[]
  results: (TestResult & { technician: LabTechnician })[]
}
