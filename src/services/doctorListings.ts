import { supabase } from '@/api/supabase'

export const doctorListings = {
  
  async getCurrentDoctorProfile() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    // 1. Tell Supabase to grab the doctor AND their nested contact folder
    const { data: doctor, error: dbError } = await supabase
      .from('Doctor')
      .select('*, DoctorContactNumber(dcontact_number)') // <--- Added the relation here!
      .eq('user_id', user.id)
      .single()

    if (dbError) throw dbError

    // 2. Extract the contact number from the nested folder
    const contactFolder = doctor.DoctorContactNumber;
    let extractedNumber = '';
    
    // Safely pull out the number whether it's an array or an object
    if (contactFolder && contactFolder.length > 0) {
      extractedNumber = contactFolder[0].dcontact_number;
    } else if (contactFolder && contactFolder.dcontact_number) {
      extractedNumber = contactFolder.dcontact_number;
    }

    // 3. Return the doctor data with the contact_number property attached
    return {
      ...doctor,
      contact_number: extractedNumber
    };
  },

  async getAllDoctors() {
    const { data, error } = await supabase
      .from('Doctor')
      .select('*, DoctorContactNumber(dcontact_number)')
      
    if (error) {
      console.error("Error fetching doctors:", error)
      throw error
    }

    // If your code says "return data" here, delete it! 
    // It MUST be this mapping function so Vue can read the number.
    return data.map((doc: any) => {
      const contactFolder = doc.DoctorContactNumber
      let extractedNumber = ''

      if (contactFolder && contactFolder.length > 0) {
        extractedNumber = contactFolder[0].dcontact_number
      } else if (contactFolder && contactFolder.dcontact_number) {
        extractedNumber = contactFolder.dcontact_number
      }

      // This injects the flat contact_number property your Vue template is looking for!
      return {
        ...doc,
        contact_number: extractedNumber
      }
    })
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

    // 2. Update the related contact number using Upsert
    if (contact_number !== undefined) {
      if (contact_number.trim() === '') {
        // If the field was cleared, cleanly delete the number from the database
        await supabase.from('DoctorContactNumber').delete().eq('doctor_id', doctorId)
      } else {
        // Upsert: Updates the number if it exists, inserts it if they didn't have one before
        const { error: contactErr } = await supabase
          .from('DoctorContactNumber')
          .upsert({ 
            doctor_id: doctorId, 
            dcontact_number: contact_number 
          })
          .eq('doctor_id', doctorId);
          
        if (contactErr) {
          console.error("Error updating contact number:", contactErr);
        }
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