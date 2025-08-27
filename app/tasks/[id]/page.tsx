'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getTask, updateTaskStatus, deleteTask } from '@/lib/supabase/tasks'
import type { TaskWithProject } from '@/lib/supabase/tasks'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Circle,
  FolderOpen,
  Tag,
  MessageSquare,
  FileText,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { Modal } from '@/components/ui/modal'
import { TaskForm } from '@/components/forms/task-form'

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<TaskWithProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [statusChangeLoading, setStatusChangeLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTaskData(params.id as string)
    }
  }, [params.id])

  const fetchTaskData = async (id: string) => {
    setLoading(true)
    try {
      const taskData = await getTask(id)
      setTask(taskData)
    } catch (error) {
      console.error('Error fetching task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'todo' | 'in_progress' | 'review' | 'completed') => {
    if (!task?.id) return
    
    setStatusChangeLoading(true)
    try {
      await updateTaskStatus(task.id, newStatus)
      await fetchTaskData(task.id)
    } catch (error) {
      console.error('Error updating task status:', error)
    } finally {
      setStatusChangeLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task?.id) return
    
    if (!confirm('このタスクを削除してもよろしいですか？')) return
    
    try {
      await deleteTask(task.id)
      router.push('/tasks')
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('タスクの削除に失敗しました')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Circle className="h-5 w-5" />
      case 'in_progress': return <Clock className="h-5 w-5" />
      case 'review': return <AlertCircle className="h-5 w-5" />
      case 'completed': return <CheckCircle className="h-5 w-5" />
      default: return <Circle className="h-5 w-5" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return '未着手'
      case 'in_progress': return '進行中'
      case 'review': return 'レビュー'
      case 'completed': return '完了'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-gray-50 text-black'
      case 'review': return 'bg-gray-100 text-gray-700'
      case 'completed': return 'bg-gray-200 text-gray-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return '緊急'
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return priority
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-gray-900 text-white'
      case 'high': return 'bg-gray-700 text-white'
      case 'medium': return 'bg-gray-500 text-white'
      case 'low': return 'bg-gray-300 text-gray-800'
      default: return 'bg-gray-400 text-white'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">タスクが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tasks')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          <h1 className="text-3xl font-bold">{task.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            編集
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ステータス</p>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value as any)}
                      disabled={statusChangeLoading}
                      className={`px-3 py-1 rounded text-sm ${getStatusColor(task.status)} border border-gray-300 focus:border-black focus:outline-none`}
                    >
                      <option value="todo">未着手</option>
                      <option value="in_progress">進行中</option>
                      <option value="review">レビュー</option>
                      <option value="completed">完了</option>
                    </select>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">優先度</p>
                  <div className="mt-1">
                    <span className={`inline-block px-3 py-1 rounded text-sm ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </div>
              </div>
              
              {task.description && (
                <div>
                  <p className="text-sm text-gray-600">説明</p>
                  <p className="mt-1 whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    期日
                  </p>
                  <p className="mt-1 font-medium">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString('ja-JP') : '未設定'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    担当者
                  </p>
                  <p className="mt-1 font-medium">{task.assignee || '未割当'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* プロジェクト情報 */}
          {task.project && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  プロジェクト
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/projects/${task.project.id}`}>
                  <div className="p-4 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    <h3 className="font-medium text-lg">{task.project.name}</h3>
                    {task.project.client_name && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {task.project.client_name}
                      </p>
                    )}
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* タグ */}
          {task.tags && task.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  タグ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* メタ情報 */}
          <Card>
            <CardHeader>
              <CardTitle>メタ情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.created_at && (
                <div>
                  <p className="text-sm text-gray-600">作成日</p>
                  <p className="text-sm font-medium">
                    {new Date(task.created_at).toLocaleDateString('ja-JP')}
                    {' '}
                    {new Date(task.created_at).toLocaleTimeString('ja-JP')}
                  </p>
                </div>
              )}
              
              {task.updated_at && (
                <div>
                  <p className="text-sm text-gray-600">更新日</p>
                  <p className="text-sm font-medium">
                    {new Date(task.updated_at).toLocaleDateString('ja-JP')}
                    {' '}
                    {new Date(task.updated_at).toLocaleTimeString('ja-JP')}
                  </p>
                </div>
              )}
              
              {task.completed_at && (
                <div>
                  <p className="text-sm text-gray-600">完了日</p>
                  <p className="text-sm font-medium">
                    {new Date(task.completed_at).toLocaleDateString('ja-JP')}
                    {' '}
                    {new Date(task.completed_at).toLocaleTimeString('ja-JP')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 進捗インジケーター */}
          <Card>
            <CardHeader>
              <CardTitle>進捗状況</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">未着手</span>
                  <Circle className={`h-4 w-4 ${task.status === 'todo' ? 'text-gray-900' : 'text-gray-300'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">進行中</span>
                  <Clock className={`h-4 w-4 ${task.status === 'in_progress' ? 'text-gray-900' : 'text-gray-300'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">レビュー</span>
                  <AlertCircle className={`h-4 w-4 ${task.status === 'review' ? 'text-gray-900' : 'text-gray-300'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">完了</span>
                  <CheckCircle className={`h-4 w-4 ${task.status === 'completed' ? 'text-gray-900' : 'text-gray-300'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 期限までの残り日数 */}
          {task.due_date && (
            <Card>
              <CardHeader>
                <CardTitle>期限まで</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {(() => {
                    const daysLeft = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    if (daysLeft < 0) {
                      return (
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{Math.abs(daysLeft)}日</p>
                          <p className="text-sm text-gray-600">期限超過</p>
                        </div>
                      )
                    } else if (daysLeft === 0) {
                      return (
                        <div>
                          <p className="text-2xl font-bold text-gray-900">今日</p>
                          <p className="text-sm text-gray-600">期限日</p>
                        </div>
                      )
                    } else if (daysLeft === 1) {
                      return (
                        <div>
                          <p className="text-2xl font-bold text-gray-700">明日</p>
                          <p className="text-sm text-gray-600">期限日</p>
                        </div>
                      )
                    } else {
                      return (
                        <div>
                          <p className="text-2xl font-bold text-gray-600">{daysLeft}日</p>
                          <p className="text-sm text-gray-600">残り</p>
                        </div>
                      )
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          if (task.id) {
            fetchTaskData(task.id)
          }
        }}
        title="タスクを編集"
      >
        <TaskForm
          task={task}
          onClose={() => {
            setIsEditModalOpen(false)
            if (task.id) {
              fetchTaskData(task.id)
            }
          }}
        />
      </Modal>
    </div>
  )
}