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
  
  const TABLE_NAME = 'clients_v2' // v3に変更（status問題を回避）
  
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
  
  // statusフィールドを確実に除外
  const { status, ...cleanedClient } = client as any
  
  // デバッグ用ログ
  if (status !== undefined) {
    console.warn('Status field detected and removed:', status)
  }
  
  const clientData = {
    name: cleanedClient.name,
    company_name: cleanedClient.company_name || null,
    email: cleanedClient.email || null,
    phone: cleanedClient.phone || null,
    address: cleanedClient.address || null,
    website: cleanedClient.website || null,
    contact_person: cleanedClient.contact_person || null,
    notes: cleanedClient.notes || null,
    created_by: user?.id || null
  }
  
  console.log('Final data to insert:', JSON.stringify(clientData, null, 2))
  console.log('Using table:', TABLE_NAME)
  
  const { data, error } = await (supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(TABLE_NAME) as any)
    .insert([clientData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating client:', error.message || error)
    console.error('Error details:', error.details)
    console.error('Error hint:', error.hint)
    console.error('Error code:', error.code)
    console.error('Full error object:', JSON.stringify(error, null, 2))
    throw error
  }
  
  return data
}

export async function updateClient(id: string, client: Partial<Client>) {
  const supabase = createSupabaseClient()
  
  const TABLE_NAME = 'clients_v2'
  
  // statusフィールドを確実に除外
  const { status, id, created_at, updated_at, ...cleanedClient } = client as any
  
  // デバッグ用ログ
  if (status !== undefined) {
    console.warn('Status field detected and removed from update:', status)
  }
  
  // 明示的にフィールドを指定してクリーンなデータを作成
  const updateData: any = {}
  if (cleanedClient.name !== undefined) updateData.name = cleanedClient.name
  if (cleanedClient.company_name !== undefined) updateData.company_name = cleanedClient.company_name
  if (cleanedClient.email !== undefined) updateData.email = cleanedClient.email
  if (cleanedClient.phone !== undefined) updateData.phone = cleanedClient.phone
  if (cleanedClient.address !== undefined) updateData.address = cleanedClient.address
  if (cleanedClient.website !== undefined) updateData.website = cleanedClient.website
  if (cleanedClient.contact_person !== undefined) updateData.contact_person = cleanedClient.contact_person
  if (cleanedClient.notes !== undefined) updateData.notes = cleanedClient.notes
  
  console.log('Update data:', JSON.stringify(updateData, null, 2))
  
  const { data, error } = await (supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(TABLE_NAME) as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating client:', error.message || error)
    console.error('Error details:', error.details)
    console.error('Error hint:', error.hint)
    console.error('Error code:', error.code)
    console.error('Full error object:', JSON.stringify(error, null, 2))
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