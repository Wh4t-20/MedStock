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
      .eq('patients_id', patientId) // FIXED: Added 's'
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

  async updatePatient(id: string, formData: any) {
    // 1. Update the main Patient table (without contact_number)
    const { error: patientErr } = await supabase
      .from('Patient')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        birth_date: formData.birth_date,
        sex: formData.sex,
        email: formData.email
      })
      .eq('patients_id', id);

    if (patientErr) throw patientErr;

    // 2. Update the separate Contact Number table
    if (formData.contact_number) {
      const { error: contactErr } = await supabase
        .from('PatientContactNumber')
        .upsert({ 
          patients_id: id, 
          pcontact_number: formData.contact_number 
        })
        .eq('patients_id', id); 
        
      if (contactErr) throw contactErr;
    }
    
    return true;
  },

  // CREATE NEW PATIENT AND LINK TO DOCTOR
  async addPatientAndLinkToDoctor(patientData: any, doctorId: string) {
    
    //Insert the new patient
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

    //Insert the Contact Number 
    if (patientData.contact_number) {
      const { error: contactError } = await supabase
        .from('PatientContactNumber')
        .insert([
          {
            patient_id: newPatient.patients_id, 
            pcontact_number: patientData.contact_number
          }
        ])
        
      if (contactError) throw contactError
    }

    // Create Dummy Lab Request to link them
    const { error: linkError } = await supabase
      .from('LabRequest')
      .insert([
        {
          patient_id: newPatient.patients_id,
          doctor_id: doctorId,
          request_date: new Date().toISOString().split('T')[0], 
          status: 'Pending',
          notes: 'Initial account creation link'
        }
      ])

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