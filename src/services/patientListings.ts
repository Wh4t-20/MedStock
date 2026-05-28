// src/services/patientService.ts
import { supabase } from '../api/supabase'

export const patientListings = {
  async getAllPatients() {
    const { data, error } = await supabase
      .from('Patient') 
      .select('*')
      .order('last_name', { ascending: true })

    if (error) throw error
    return data
  },
  
  async getPatientById(patientId: string) {
    const { data, error } = await supabase
      .from('Patient')
      .select('*')
      .eq('patient_id', patientId)
      .single()

    if (error) throw error
    return data
  },
  
  async getPatientsByDoctor(doctorId: string) {
      const { data, error } = await supabase
        .from('Patient') 
        .select(`
          *,
          "LabRequest"!inner(doctor_id) 
        `)
        .eq('"LabRequest".doctor_id', doctorId) 

      if (error) throw error

      return data
    },

  async createPatient(newPatientData: any) {
    const { data, error } = await supabase
      .from('Patient')
      .insert([newPatientData])
      .select()

    if (error) throw error
    return data
  },

  async updatePatient(patientId: string, updates: any) {
    const { data, error } = await supabase
      .from('Patient')
      .update(updates)
      .eq('patient_id', patientId)
      .select()

    if (error) throw error
    return data
  },

  async deletePatient(patientId: string) {
    const { error } = await supabase
      .from('Patient')
      .delete()
      .eq('patient_id', patientId)

    if (error) throw error
    return true
  },

  // 🟢 CREATE NEW PATIENT (FULL SCHEMA) & LINK TO DOCTOR
  async addPatientAndLinkToDoctor(patientData: any, doctorId: string) {
    
    // STEP 1: Insert the new patient
    const { data: newPatient, error: patientError } = await supabase
      .from('Patient')
      .insert([
        {
          first_name: patientData.first_name,
          middle_name: patientData.middle_name,
          last_name: patientData.last_name,
          birth_date: patientData.birth_date,
          sex: patientData.sex,
          address: patientData.address,
          weight: patientData.weight || null,
          height: patientData.height || null,
          email: patientData.email
        }
      ])
      .select()
      .single()
    
    console.log("Newly created patient data:", newPatient)

    if (patientError) throw patientError

    // STEP 2: Insert the Contact Number (if they provided one)
    if (patientData.contact_number) {
      const { error: contactError } = await supabase
        .from('PatientContactNumber')
        .insert([
          {
            patient_id: newPatient.patients_id, // Grab the ID from Step 1
            pcontact_number: patientData.contact_number
          }
        ])
        
      if (contactError) throw contactError
    }

    // STEP 3: Build the Bridge! Create the Lab Request
    const { error: linkError } = await supabase
      .from('LabRequest')
      .insert([
        {
          patient_id: newPatient.patients_id,
          doctor_id: doctorId,
          request_date: new Date().toISOString().split('T')[0], // Sets today's date (YYYY-MM-DD)
          status: 'Pending',
          notes: 'Initial account creation link'
        }
      ])

    if (linkError) throw linkError

    return newPatient
  }
}