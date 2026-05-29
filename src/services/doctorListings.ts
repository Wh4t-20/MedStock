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
      .select('*')
      
    if (error) throw error
    return data
  }
  
}