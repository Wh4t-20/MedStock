import { supabase } from '../api/supabase'

export interface TestTypeInsert {
    test_name: string
    category: string
    description?: string
    normal_range?: string
}

export type TestTypeUpdate = Partial<TestTypeInsert>

export const testypeListings = {

    async getAllTestTypes() {
        const { data, error } = await supabase
            .from('TestType')
            .select('*')
            .order('test_name', { ascending: true })

        if (error) throw error
        return data
    },

    async createTestType(newData: TestTypeInsert) {
        const { data, error } = await supabase
            .from('TestType')
            .insert([newData])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateTestType(id: number, updates: TestTypeUpdate) {
        const { data, error } = await supabase
            .from('TestType')
            .update(updates)
            .eq('test_type_id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteTestType(id: number) {
        const { error } = await supabase
            .from('TestType')
            .delete()
            .eq('test_type_id', id)

        if (error) throw error
        return true
    }
}
