import { supabase } from '../api/supabase'

export const technicianListings = {
  async getAllPatients() {
    const { data, error } = await supabase
      .from('Technician') 
      .select('*')
      .order('last_name', { ascending: true })

    if (error) throw error
    return data
  },
}