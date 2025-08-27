/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client'

export interface Project {
  id?: string
  name: string
  description?: string
  client_id?: string
  client_name?: string
  status: string
  priority: string
  start_date?: string
  end_date?: string
  production_url?: string
  staging_url?: string
  development_url?: string
  repository_url?: string
  progress?: number
  development_fee?: number  // 制作費用
  monthly_revenue?: number  // 月額収入
  monthly_cost?: number     // 月額支出
  created_at?: string
  updated_at?: string
}

export async function getProjects() {
  const supabase = createClient()
  
  // projects_v2を使用（RLS問題を回避）
  // 元のテーブルに戻す場合は 'projects_v2' を 'projects' に変更
  const TABLE_NAME = 'projects_v2' // または 'projects'
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }
  
  return data || []
}

export async function getProject(id: string) {
  const supabase = createClient()
  
  const TABLE_NAME = 'projects_v2' // 統一してprojects_v2を使用
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching project:', error)
    return null
  }
  
  return data
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  
  const TABLE_NAME = 'projects_v2' // 統一してprojects_v2を使用
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // progressがundefinedまたはnullの場合は0を設定
  const projectData = {
    ...project,
    created_by: user?.id || null,
    progress: project.progress || 0
  }
  
  console.log('Creating project with data:', projectData)
  console.log('Using table:', TABLE_NAME)
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert([projectData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating project:', error.message, error.details, error.hint)
    throw error
  }
  
  return data
}

export async function updateProject(id: string, project: Partial<Project>) {
  const supabase = createClient()
  
  const TABLE_NAME = 'projects_v2' // 統一してprojects_v2を使用
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(project)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating project:', error)
    throw error
  }
  
  return data
}

export async function deleteProject(id: string) {
  const supabase = createClient()
  
  const TABLE_NAME = 'projects_v2' // 統一してprojects_v2を使用
  
  const { error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting project:', error)
    throw error
  }
  
  return true
}