import { supabase } from '../api/supabase'

// Define the shape of your data
export interface TestTypeInsert {
  test_name: string
  category: string
  description?: string
  normal_range?: string
}

export const testTypeListings = {
  
  // --- READ ---
  async getAllTestTypes() {
    const { data, error } = await supabase
      .from('TestType') 
      .select('*')
      .order('category', { ascending: true })
      .order('test_name', { ascending: true })

    if (error) throw error
    return data
  },

  async getTestTypeById(id: string) {
    const { data, error } = await supabase
      .from('TestType')
      .select('*')
      .eq('test_type_id', id)
      .single()

    if (error) throw error
    return data
  },

  // --- CREATE ---
  async addTestType(newTest: TestTypeInsert) {
    const { data, error } = await supabase
      .from('TestType')
      .insert([newTest])
      .select()

    if (error) throw error
    return data
  },

  // --- UPDATE ---
  async updateTestType(id: string, updates: Partial<TestTypeInsert>) {
    const { data, error } = await supabase
      .from('TestType')
      .update(updates)
      .eq('test_type_id', id)
      .select()

    if (error) throw error
    return data
  },

  // --- DELETE ---
  async deleteTestType(id: string) {
    const { error } = await supabase
      .from('TestType')
      .delete()
      .eq('test_type_id', id)

    if (error) throw error
    return true
  }
}