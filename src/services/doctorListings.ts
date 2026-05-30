import { supabase } from '@/api/supabase'

export const doctorListings = {
  
  async getCurrentDoctorProfile() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data: doctor, error: dbError } = await supabase
      .from('Doctor')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (dbError) throw dbError
    return doctor
  },

  async getAllDoctors() {
    // This fetches the doctor AND their related contact numbers
    const { data, error } = await supabase
      .from('Doctor')
      .select('*, DoctorContactNumber(dcontact_number)')
      
    if (error) {
      console.error("Error fetching doctors:", error)
      throw error
    }
    return data
  },
  
  async createDoctor(newDoctorData: any) {
    // Separate the contact number from the rest of the doctor data
    const { contact_number, ...doctorData } = newDoctorData

    // 1. Create the Doctor
    const { data, error } = await supabase
      .from('Doctor')
      .insert([doctorData])
      .select()
      .single() 

    if (error) {
      console.error("Error creating doctor:", error)
      throw error
    }

    // 2. If a contact number was provided, save it to the related table
    if (contact_number) {
      const { error: contactError } = await supabase
        .from('DoctorContactNumber')
        .insert([{ doctor_id: data.doctor_id, dcontact_number: contact_number }])
      
      if (contactError) console.error("Error saving contact number:", contactError)
    }

    return data
  },

  async updateDoctor(doctorId: string, updates: any) {
    // Separate the contact number from the rest of the doctor data
    const { contact_number, ...doctorData } = updates

    // 1. Update the Doctor profile
    const { data, error } = await supabase
      .from('Doctor')
      .update(doctorData)
      .eq('doctor_id', doctorId) 
      .select()
      .single()

    if (error) {
      console.error("Error updating doctor:", error)
      throw error
    }

    // 2. Update the related contact number. 
    // We wipe the old one and insert the new one to avoid conflicts if they didn't have one before.
    if (contact_number !== undefined) {
      await supabase.from('DoctorContactNumber').delete().eq('doctor_id', doctorId)
      
      if (contact_number.trim() !== '') {
        await supabase
          .from('DoctorContactNumber')
          .insert([{ doctor_id: doctorId, dcontact_number: contact_number }])
      }
    }

    return data
  },

  async deleteDoctor(doctorId: string) {
    // Note: If you have foreign key constraints set up properly in Supabase (ON DELETE CASCADE), 
    // deleting the doctor will automatically delete their contact number.
    const { error } = await supabase
      .from('Doctor')
      .delete()
      .eq('doctor_id', doctorId)

    if (error) {
      console.error("Error deleting doctor:", error)
      throw error
    }
    return true
  }
}