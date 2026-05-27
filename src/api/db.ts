/**
 * Simulated in-memory database.
 * Replace this module's functions with real API calls to your backend.
 */

import type {
  Patient, Doctor, LabTechnician, TestType,
  LabRequest, RequestDetail, TestResult
} from '@/types'

// ─── Seed data ───────────────────────────────────────────────────────────────

export const patients: Patient[] = [
  {
    patient_id: 'P001', first_name: 'Maria', middle_name: 'Santos', last_name: 'Reyes',
    date_of_birth: '1990-03-15', sex: 'Female', email: 'maria.reyes@email.com',
    contact_number: '09171234567', address: '123 Rizal St., Manila',
    height: 158, weight: 55
  },
  {
    patient_id: 'P002', first_name: 'Juan', middle_name: 'dela', last_name: 'Cruz',
    date_of_birth: '1985-07-22', sex: 'Male', email: 'juan.cruz@email.com',
    contact_number: '09281234567', address: '456 Mabini Ave., Quezon City',
    height: 172, weight: 70
  },
  {
    patient_id: 'P003', first_name: 'Ana', middle_name: 'Garcia', last_name: 'Lim',
    date_of_birth: '2000-11-05', sex: 'Female', email: 'ana.lim@email.com',
    contact_number: '09391234567', address: '789 Bonifacio Blvd., Makati',
    height: 163, weight: 58
  }
]

export const doctors: Doctor[] = [
  {
    doctor_id: 'D001', first_name: 'Roberto', last_name: 'Aquino',
    email: 'dr.aquino@clinic.com', contact_number: '09501234567',
    specialization: 'Internal Medicine'
  },
  {
    doctor_id: 'D002', first_name: 'Luisa', last_name: 'Fernandez',
    email: 'dr.fernandez@clinic.com', contact_number: '09611234567',
    specialization: 'Endocrinology'
  },
  {
    doctor_id: 'D003', first_name: 'Marco', last_name: 'Villanueva',
    email: 'dr.villanueva@clinic.com', contact_number: '09721234567',
    specialization: 'Hematology'
  }
]

export const labTechnicians: LabTechnician[] = [
  {
    technician_id: 'T001', first_name: 'Carlos', last_name: 'Medina',
    email: 'c.medina@lab.com', contact_number: '09831234567',
    license_number: 'MLS-2018-001234'
  },
  {
    technician_id: 'T002', first_name: 'Patricia', last_name: 'Torres',
    email: 'p.torres@lab.com', contact_number: '09941234567',
    license_number: 'MLS-2019-005678'
  }
]

export const testTypes: TestType[] = [
  {
    test_type_id: 'TT001', test_name: 'CBC',
    category: 'Hematology',
    description: 'Complete Blood Count — measures different components of blood.',
    normal_range: 'WBC: 4.5–11.0 ×10⁹/L, RBC: 4.5–5.5 ×10¹²/L, Hgb: 13.5–17.5 g/dL'
  },
  {
    test_type_id: 'TT002', test_name: 'Urinalysis',
    category: 'Urinalysis',
    description: 'Analysis of urine for physical, chemical, and microscopic properties.',
    normal_range: 'pH: 4.5–8.0, Specific Gravity: 1.005–1.030, Protein: Negative'
  },
  {
    test_type_id: 'TT003', test_name: 'HbA1c',
    category: 'Clinical Chemistry',
    description: 'Glycated hemoglobin test measuring average blood glucose over 2–3 months.',
    normal_range: '< 5.7% (Normal), 5.7–6.4% (Prediabetes), ≥ 6.5% (Diabetes)'
  },
  {
    test_type_id: 'TT004', test_name: 'Lipid Panel',
    category: 'Clinical Chemistry',
    description: 'Measures cholesterol levels and triglycerides.',
    normal_range: 'Total Cholesterol < 200 mg/dL, LDL < 100 mg/dL, HDL > 60 mg/dL'
  },
  {
    test_type_id: 'TT005', test_name: 'Blood Glucose (FBS)',
    category: 'Clinical Chemistry',
    description: 'Fasting blood sugar test.',
    normal_range: '70–99 mg/dL (Normal), 100–125 mg/dL (Prediabetes)'
  }
]

export const labRequests: LabRequest[] = [
  {
    request_id: 'LR001', patient_id: 'P001', doctor_id: 'D001',
    request_date: '2026-05-20T09:00:00', status: 'Completed',
    notes: 'Annual check-up panel'
  },
  {
    request_id: 'LR002', patient_id: 'P002', doctor_id: 'D002',
    request_date: '2026-05-22T10:30:00', status: 'In Progress',
    notes: 'Monitor HbA1c levels — diabetic follow-up'
  },
  {
    request_id: 'LR003', patient_id: 'P003', doctor_id: 'D001',
    request_date: '2026-05-27T08:00:00', status: 'Pending',
    notes: 'Pre-employment screening'
  }
]

export const requestDetails: RequestDetail[] = [
  { detail_id: 'RD001', request_id: 'LR001', test_type_id: 'TT001' },
  { detail_id: 'RD002', request_id: 'LR001', test_type_id: 'TT002' },
  { detail_id: 'RD003', request_id: 'LR001', test_type_id: 'TT003' },
  { detail_id: 'RD004', request_id: 'LR002', test_type_id: 'TT003' },
  { detail_id: 'RD005', request_id: 'LR002', test_type_id: 'TT005' },
  { detail_id: 'RD006', request_id: 'LR003', test_type_id: 'TT001' },
  { detail_id: 'RD007', request_id: 'LR003', test_type_id: 'TT002' }
]

export const testResults: TestResult[] = [
  {
    result_id: 'TR001', detail_id: 'RD001', technician_id: 'T001',
    result_value: 'WBC: 6.8, RBC: 4.9, Hgb: 14.2, Hct: 42%, Plt: 230',
    result_date: '2026-05-20T14:00:00', remarks: 'All values within normal range.'
  },
  {
    result_id: 'TR002', detail_id: 'RD002', technician_id: 'T001',
    result_value: 'Color: Yellow, Turbidity: Clear, pH: 6.0, Protein: Neg, Glucose: Neg',
    result_date: '2026-05-20T14:30:00', remarks: 'Normal urinalysis.'
  },
  {
    result_id: 'TR003', detail_id: 'RD003', technician_id: 'T002',
    result_value: '5.8%',
    result_date: '2026-05-20T15:00:00', remarks: 'Prediabetic range — recommend dietary modification.'
  },
  {
    result_id: 'TR004', detail_id: 'RD004', technician_id: 'T002',
    result_value: '7.2%',
    result_date: '2026-05-23T11:00:00', remarks: 'Diabetic range — continue medication.'
  }
]

// ─── Simple ID generator ──────────────────────────────────────────────────────

let counters: Record<string, number> = {
  P: patients.length + 1,
  D: doctors.length + 1,
  T: labTechnicians.length + 1,
  TT: testTypes.length + 1,
  LR: labRequests.length + 1,
  RD: requestDetails.length + 1,
  TR: testResults.length + 1,
}

export function nextId(prefix: string): string {
  const n = counters[prefix]!
  counters[prefix] = n + 1
  return `${prefix}${String(n).padStart(3, '0')}`
}
