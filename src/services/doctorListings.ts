// src/services/doctorService.ts
import { supabase } from '@/api/supabase'

export const doctorListings = {
  async getCurrentDoctorProfile() {
    // 1. Get the current user's UUID
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    // 2. Fetch the matching row from the Doctor table
    const { data: doctor, error: dbError } = await supabase
      .from('Doctor') // Change to 'doctor' if your table is lowercase!
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