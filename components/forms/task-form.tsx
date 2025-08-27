'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { createTask, updateTask } from '@/lib/supabase/tasks'
import { getProjects } from '@/lib/supabase/projects'
import { getAuthUsers } from '@/lib/supabase/auth-users'
import type { Task } from '@/lib/supabase/tasks'
import type { Project } from '@/lib/supabase/projects'
import { Calendar, User, AlertCircle } from 'lucide-react'

interface TaskFormProps {
  task?: Task
  projectId?: string
  onClose?: () => void
}

export function TaskForm({ task, projectId, onClose }: TaskFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    project_id: task?.project_id || projectId || '',
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo' as Task['status'],
    priority: task?.priority || 'medium' as Task['priority'],
    due_date: task?.due_date || '',
    assignee: task?.assignee || ''
  })

  useEffect(() => {
    fetchProjects()
    fetchUsers()
  }, [])

  const fetchProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await getAuthUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.project_id) {
      setError('プロジェクトを選択してください')
      setLoading(false)
      return
    }

    if (!formData.title.trim()) {
      setError('タスク名を入力してください')
      setLoading(false)
      return
    }

    try {
      if (task?.id) {
        await updateTask(task.id, formData)
      } else {
        await createTask(formData)
      }
      
      router.refresh()
      if (onClose) onClose()
    } catch (err) {
      console.error('Error saving task:', err)
      setError(err instanceof Error ? err.message : 'タスクの保存中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }))
  }

  const priorityOptions = [
    { value: 'urgent', label: '緊急', color: 'text-gray-900' },
    { value: 'high', label: '高', color: 'text-gray-700' },
    { value: 'medium', label: '中', color: 'text-gray-600' },
    { value: 'low', label: '低', color: 'text-gray-500' }
  ]

  const statusOptions = [
    { value: 'todo', label: '未着手' },
    { value: 'in_progress', label: '進行中' },
    { value: 'review', label: 'レビュー' },
    { value: 'completed', label: '完了' }
  ]

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* プロジェクト選択 */}
          <div className="space-y-2">
            <Label htmlFor="project_id">プロジェクト *</Label>
            <Select
              id="project_id"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
              className="w-full"
            >
              <option value="">プロジェクトを選択</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} {project.client_name && `(${project.client_name})`}
                </option>
              ))}
            </Select>
          </div>

          {/* タスク名 */}
          <div className="space-y-2">
            <Label htmlFor="title">タスク名 *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="例: ユーザー認証機能の実装"
            />
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="タスクの詳細な説明を入力"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 優先度 */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                優先度
              </Label>
              <Select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* ステータス */}
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* 期日と担当者 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 期日 */}
            <div className="space-y-2">
              <Label htmlFor="due_date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                期日
              </Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
              />
            </div>

            {/* 担当者 */}
            <div className="space-y-2">
              <Label htmlFor="assignee" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                担当者
              </Label>
              <Select
                id="assignee"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">担当者を選択</option>
                {users.map((user) => (
                  <option key={user.id} value={user.full_name || user.email}>
                    {user.full_name || user.email} {user.department && `(${user.department})`}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-gray-50 text-gray-900 text-sm rounded border border-black">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : (task?.id ? '更新' : '作成')}
          </Button>
        </div>
      </form>
    </Card>
  )
}