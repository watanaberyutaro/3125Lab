import { createClient } from './client'

export interface Domain {
  id?: string
  project_id?: string
  domain_name: string
  contract_date: string
  contract_period: number
  renewal_date?: string
  domain_user_id?: string
  domain_password?: string
  registrar?: string
  notes?: string
  created_at?: string
  updated_at?: string
  project?: {
    id: string
    name: string
  }
}

// 全てのドメインを取得
export async function getDomains() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('domains_v2')
    .select(`
      *,
      project:projects_v2(
        id,
        name
      )
    `)
    .order('renewal_date', { ascending: true })

  if (error) {
    console.error('Error fetching domains:', error)
    return []
  }

  return data || []
}

// プロジェクトIDでドメインを取得
export async function getDomainsByProject(projectId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('domains_v2')
    .select('*')
    .eq('project_id', projectId)
    .order('domain_name', { ascending: true })

  if (error) {
    console.error('Error fetching project domains:', error)
    return []
  }

  return data || []
}

// ドメインを作成
export async function createDomain(domain: Omit<Domain, 'id' | 'created_at' | 'updated_at' | 'renewal_date'>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('domains_v2')
    // @ts-expect-error Supabase type issue
    .insert(domain)
    .select()
    .single()

  if (error) {
    console.error('Error creating domain:', error)
    throw error
  }

  return data
}

// ドメインを更新
export async function updateDomain(id: string, updates: Partial<Domain>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('domains_v2')
    // @ts-expect-error Supabase type issue
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating domain:', error)
    throw error
  }

  return data
}

// ドメインを削除
export async function deleteDomain(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('domains_v2')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting domain:', error)
    throw error
  }

  return true
}

// 更新期限が近いドメインを取得
export async function getExpiringDomains(daysAhead: number = 30) {
  const supabase = createClient()

  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)

  const { data, error } = await supabase
    .from('domains_v2')
    .select(`
      *,
      project:projects_v2(
        id,
        name
      )
    `)
    .lte('renewal_date', futureDate.toISOString())
    .gte('renewal_date', new Date().toISOString())
    .order('renewal_date', { ascending: true })

  if (error) {
    console.error('Error fetching expiring domains:', error)
    return []
  }

  return data || []
}