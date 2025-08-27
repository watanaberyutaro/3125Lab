import { createClient as createSupabaseClient } from '@/lib/supabase/client'

export interface User {
  id?: string
  name: string
  email: string
  role?: string
  department?: string
  created_at?: string
  updated_at?: string
}

const TABLE_NAME = 'users_v2'

export async function getUsers() {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  
  return data || []
}

export async function getUser(id: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([user])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user:', error)
    throw error
  }
  
  return data
}

export async function updateUser(id: string, user: Partial<User>) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(user)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user:', error)
    throw error
  }
  
  return data
}

export async function deleteUser(id: string) {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting user:', error)
    throw error
  }
  
  return true
}