/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

export interface Task {
  id?: string
  project_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  due_date?: string
  assignee?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  completed_at?: string
  tags?: string[]
}

export interface TaskWithProject extends Task {
  project?: {
    id: string
    name: string
    client_name?: string
  }
}

const TABLE_NAME = 'tasks_v2'

export async function getTasks() {
  const supabase = createSupabaseClient()
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select(`
      *,
      project:projects_v2(
        id,
        name,
        client_name
      )
    `)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
  
  return data || []
}

export async function getTasksByProject(projectId: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching tasks by project:', error)
    return []
  }
  
  return data || []
}

export async function getTask(id: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select(`
      *,
      project:projects_v2(
        id,
        name,
        client_name
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching task:', error)
    return null
  }
  
  return data
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const taskData = {
    ...task,
    created_by: user?.id || null,
    tags: task.tags || []
  }
  
  console.log('Creating task with data:', taskData)
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert([taskData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating task:', error.message, error.details, error.hint)
    throw error
  }
  
  return data
}

export async function updateTask(id: string, task: Partial<Task>) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(task)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating task:', error)
    throw error
  }
  
  return data
}

export async function deleteTask(id: string) {
  const supabase = createSupabaseClient()
  
  const { error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting task:', error)
    throw error
  }
  
  return true
}

export async function updateTaskStatus(id: string, status: Task['status']) {
  return updateTask(id, { status })
}

export async function getTaskStats() {
  const supabase = createSupabaseClient()
  
  const { data, error } = await (supabase.from(TABLE_NAME) as any) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('status, priority')
  
  if (error) {
    console.error('Error fetching task stats:', error)
    return {
      total: 0,
      byStatus: {},
      byPriority: {}
    }
  }
  
  const stats = {
    total: data?.length || 0,
    byStatus: {
      todo: 0,
      in_progress: 0,
      review: 0,
      completed: 0
    },
    byPriority: {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  }
  
  data?.forEach((task: any) => {
    if (task.status) stats.byStatus[task.status]++
    if (task.priority) stats.byPriority[task.priority]++
  })
  
  return stats
}