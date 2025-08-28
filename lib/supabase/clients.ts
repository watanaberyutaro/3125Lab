/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

export interface Client {
  id?: string
  name: string
  company_name?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  contact_person?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export async function getClients() {
  const supabase = createSupabaseClient()
  
  const TABLE_NAME = 'clients_v2' // RLS問題を回避
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }
  
  return data || []
}

export async function getClient(id: string) {
  const supabase = createSupabaseClient()
  
  const TABLE_NAME = 'clients_v2'
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching client:', error)
    return null
  }
  
  return data
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createSupabaseClient()
  
  const TABLE_NAME = 'clients_v2'
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // statusフィールドを除外して、テーブル定義に合わせる
  const { status, ...cleanClient } = client as any
  
  const clientData = {
    ...cleanClient,
    created_by: user?.id || null
  }
  
  console.log('Creating client with data:', clientData)
  console.log('Using table:', TABLE_NAME)
  
  const { data, error } = await (supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(TABLE_NAME) as any)
    .insert([clientData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating client:', error.message, error.details, error.hint)
    console.error('Full error object:', error)
    throw error
  }
  
  return data
}

export async function updateClient(id: string, client: Partial<Client>) {
  const supabase = createSupabaseClient()
  
  const TABLE_NAME = 'clients_v2'
  
  // statusフィールドを除外して、テーブル定義に合わせる
  const { status, ...cleanClient } = client as any
  
  const { data, error } = await (supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(TABLE_NAME) as any)
    .update(cleanClient)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating client:', error)
    console.error('Full error object:', error)
    throw error
  }
  
  return data
}

export async function deleteClient(id: string) {
  const supabase = createSupabaseClient()
  
  const TABLE_NAME = 'clients_v2'
  
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting client:', error)
    throw error
  }
  
  return true
}