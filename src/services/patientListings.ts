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

  async getPatientById(patientId: number) {
    const { data, error } = await supabase
      .from('Patient')
      .select('*')
      .eq('patients_id', patientId)
      .single()

    if (error) throw error
    return data
  },

  async getPatientsByDoctor(doctorId: string | number) {
    // Step 1: get all patient_ids from LabRequest for this doctor
    const { data: requests, error: reqError } = await supabase
      .from('LabRequest')
      .select('patient_id')
      .eq('doctor_id', doctorId)

    if (reqError) throw reqError
    if (!requests?.length) return []

    // Step 2: deduplicate IDs
    const ids = [...new Set(requests.map((r: any) => r.patient_id))]

    // Step 3: fetch patients — PK is patients_id (with the 's')
    const { data: patients, error: patError } = await supabase
      .from('Patient')
      .select('*')
      .in('patients_id', ids)

    if (patError) throw patError
    return patients ?? []
  },

  async createPatient(newPatientData: any) {
    const { data, error } = await supabase
      .from('Patient')
      .insert([newPatientData])
      .select()

    if (error) throw error
    return data
  },

  async updatePatient(patientId: number, updates: any) {
    const { data, error } = await supabase
      .from('Patient')
      .update(updates)
      .eq('patients_id', patientId)
      .select()

    if (error) throw error
    return data
  },

  async deletePatient(patientId: number) {
    const { error } = await supabase
      .from('Patient')
      .delete()
      .eq('patients_id', patientId)

    if (error) throw error
    return true
  },

  async addPatientAndLinkToDoctor(patientData: any, doctorId: string | number) {
    // Step 1: Insert the new patient
    const { data: newPatient, error: patientError } = await supabase
      .from('Patient')
      .insert([{
        first_name:  patientData.first_name,
        middle_name: patientData.middle_name,
        last_name:   patientData.last_name,
        birth_date:  patientData.birth_date,
        sex:         patientData.sex,
        address:     patientData.address,
        weight:      patientData.weight  || null,
        height:      patientData.height  || null,
        email:       patientData.email
      }])
      .select()
      .single()

    if (patientError) throw patientError

    // Step 2: Insert contact number if provided
    if (patientData.contact_number) {
      const { error: contactError } = await supabase
        .from('PatientContactNumber')
        .insert([{
          patient_id:      newPatient.patients_id,
          pcontact_number: patientData.contact_number
        }])
      if (contactError) throw contactError
    }

    // Step 3: Create LabRequest to link patient to doctor
    const { error: linkError } = await supabase
      .from('LabRequest')
      .insert([{
        patient_id:   newPatient.patient_id,
        doctor_id:    doctorId,
        request_date: new Date().toISOString().split('T')[0],
        status:       'Pending',
        notes:        'Initial registration'
      }])

    if (linkError) throw linkError
    return newPatient
  },

  async getCurrentPatient() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data: patient, error: dbError } = await supabase
      .from('Patient')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (dbError) throw dbError
    return patient
  }
}
