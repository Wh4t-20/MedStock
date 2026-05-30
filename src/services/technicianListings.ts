import { supabase } from '../api/supabase'

export interface TechnicianInsert {
  first_name: string
  middle_name?: string 
  last_name: string
  email: string
  license_number: string
  contact_number?: string 
}

export type TechnicianUpdate = Partial<TechnicianInsert>

export const technicianListings = {
  
  // --- READ ---
  async getAllTechnician() {
    const { data, error } = await supabase
      .from('LabTechnician') 
      .select('*, LabTechContactNumber(tcontact_number)')
      .order('last_name', { ascending: true })

    if (error) throw error
    return data
  },

  // --- CREATE (ADD) ---
  async addTechnician(technicianData: TechnicianInsert) {
    // 1. Separate the contact number from the main table data
    const { contact_number, ...mainData } = technicianData

    // 2. Insert the main Technician
    const { data: newTech, error } = await supabase
      .from('LabTechnician')
      .insert([mainData]) 
      .select()
      .single() 

    if (error) throw error

    // 3. If a contact number was provided, insert it into the second table
    if (contact_number && contact_number.trim() !== '') {
      const { error: contactError } = await supabase
        .from('LabTechContactNumber')
        .insert([{ technician_id: newTech.technician_id, tcontact_number: contact_number }])
      
      if (contactError) console.error("Error saving contact number:", contactError)
    }

    return newTech
  },

  // --- UPDATE (EDIT) ---
  async editTechnician(id: number, updates: TechnicianUpdate) {
    // 1. Separate the contact number from the main table data
    const { contact_number, ...mainData } = updates

    // 2. Update the main Technician
    const { data: updatedTech, error } = await supabase
      .from('LabTechnician')
      .update(mainData) 
      .eq('technician_id', id) 
      .select()
      .single()

    if (error) throw error

    // 3. Handle Contact Number Update (Delete old ones, insert new one)
    if (contact_number !== undefined) {
      await supabase.from('LabTechContactNumber').delete().eq('technician_id', id)
      
      if (contact_number.trim() !== '') {
        await supabase
          .from('LabTechContactNumber')
          .insert([{ technician_id: id, tcontact_number: contact_number }])
      }
    }

    return updatedTech
  },

  // --- DELETE ---
  async deleteTechnician(id: number) {
    // Supabase will automatically delete the contact numbers if your Foreign Key is set to "Cascade On Delete".
    // If not, we delete the contact numbers first to avoid errors.
    await supabase.from('LabTechContactNumber').delete().eq('technician_id', id)

    const { error } = await supabase
      .from('LabTechnician')
      .delete()
      .eq('technician_id', id)

    if (error) throw error
    return true 
  }
}