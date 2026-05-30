import { supabase } from '../api/supabase'

export interface TestTypeInsert {
    test_name: string
    category: string
    description?: string
    normal_range?: string
}

export const testypeListings = {
  
    // --- READ ---
    async getAllT() {
      const { data, error } = await supabase
        .from('LabTechnician') 
        .select('*, LabTechContactNumber(tcontact_number)')
        .order('last_name', { ascending: true })
  
      if (error) throw error
      return data
    },
}
