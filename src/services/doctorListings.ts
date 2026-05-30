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
    const { data, error } = await supabase
      .from('Doctor')
      .select('*, DoctorContanctNumber(dcontact_number)')
      .select('*')
      
    if (error) throw error
    return data
  },
  
  async createDoctor(newDoctorData: any) {
    const { contact_number, ...mainData } = newDoctorData
    const { data, error } = await supabase
      .from('Doctor')
      .insert([mainData])
      .select()
      .single() 

    if (error) {
      console.error("Error creating doctor:", error)
      throw error
    }
    return data
  },

  async updateDoctor(doctorId: string, updates: any) {
    const { data, error } = await supabase
      .from('Doctor')
      .update(updates)
      .eq('doctor_id', doctorId) 
      .select()
      .single()

    if (error) {
      console.error("Error updating doctor:", error)
      throw error
    }
    return data
  },

  async deleteDoctor(doctorId: string) {
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