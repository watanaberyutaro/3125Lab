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
  
  // 許可されたフィールドのみを明示的に取得（それ以外は完全に無視）
  const clientData = {
    name: client.name,
    company_name: client.company_name || null,
    email: client.email || null,
    phone: client.phone || null,
    address: client.address || null,
    website: client.website || null,
    contact_person: client.contact_person || null,
    notes: client.notes || null,
    created_by: user?.id || null
  }
  
  // デバッグ: 除外されたフィールドを確認
  const providedFields = Object.keys(client)
  const allowedFields = ['name', 'company_name', 'email', 'phone', 'address', 'website', 'contact_person', 'notes']
  const excludedFields = providedFields.filter(key => !allowedFields.includes(key))
  if (excludedFields.length > 0) {
    console.warn('Excluded fields from insert:', excludedFields)
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
  
  // 許可されたフィールドのみを明示的に取得（それ以外は完全に無視）
  const allowedFields = ['name', 'company_name', 'email', 'phone', 'address', 'website', 'contact_person', 'notes']
  const updateData: any = {}
  
  // 許可されたフィールドのみをコピー
  for (const field of allowedFields) {
    if (field in client && (client as any)[field] !== undefined) {
      updateData[field] = (client as any)[field]
    }
  }
  
  // デバッグ: 除外されたフィールドを確認
  const excludedFields = Object.keys(client).filter(key => !allowedFields.includes(key))
  if (excludedFields.length > 0) {
    console.warn('Excluded fields from update:', excludedFields)
  }
  
  console.log('Final update data (only allowed fields):', JSON.stringify(updateData, null, 2))
  
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