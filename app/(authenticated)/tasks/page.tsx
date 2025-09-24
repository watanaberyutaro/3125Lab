'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { TaskForm } from '@/components/forms/task-form'
import { getTasks, deleteTask, updateTaskStatus } from '@/lib/supabase/tasks'
import type { TaskWithProject } from '@/lib/supabase/tasks'
import { 
  Plus, 
  Search,
  Clock,
  User,
  Calendar,
  CheckCircle,
  Circle,
  AlertCircle,
  Trash2,
  Edit,
  Eye
} from 'lucide-react'
import Link from 'next/link'

const columns = [
  { id: 'todo', title: '未着手', color: 'bg-gray-100', icon: Circle },
  { id: 'in_progress', title: '進行中', color: 'bg-gray-50', icon: Clock },
  { id: 'review', title: 'レビュー', color: 'bg-gray-50', icon: AlertCircle },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [showCompleted, setShowCompleted] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithProject | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('このタスクを削除してもよろしいですか？')) return
    
    try {
      await deleteTask(id)
      await fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'todo' | 'in_progress' | 'review' | 'completed') => {
    try {
      await updateTaskStatus(id, newStatus)
      await fetchTasks()
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const openEditModal = (task: TaskWithProject) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const closeModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(undefined)
    fetchTasks()
  }

  const filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = task.title.toLowerCase().includes(searchLower) ||
           task.project?.name?.toLowerCase().includes(searchLower) ||
           task.assignee?.toLowerCase().includes(searchLower) ||
           task.description?.toLowerCase().includes(searchLower)
    
    // 完了タスクの表示/非表示
    if (!showCompleted && task.status === 'completed') {
      return false
    }
    if (showCompleted && task.status !== 'completed') {
      return false
    }
    
    return matchesSearch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-gray-100 text-gray-900 border-black'
      case 'high': return 'bg-gray-100 text-gray-600 border-black'
      case 'medium': return 'bg-gray-50 text-gray-700 border-black'
      case 'low': return 'bg-gray-100 text-gray-800 border-black'
      default: return 'bg-gray-100 text-gray-800 border-black'
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">タスクを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{showCompleted ? '完了タスク' : 'タスク'}</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {showCompleted ? '完了したタスクの一覧' : 'プロジェクトタスクを追跡・管理'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCompleted(!showCompleted)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {showCompleted ? (
              <>
                <Circle className="h-4 w-4" />
                <span className="hidden sm:inline">未完了タスク</span>
                <span className="sm:hidden">未完了</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">完了タスク</span>
                <span className="sm:hidden">完了</span>
              </>
            )}
          </Button>
          {!showCompleted && (
            <Button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">新規タスク</span>
              <span className="sm:hidden">新規</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="タスクを検索..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1 text-sm transition-colors rounded-md ${
              viewMode === 'board' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-black'
            }`}
          >
            <span className="hidden sm:inline">ボード</span>
            <span className="sm:hidden">📋</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm transition-colors rounded-md ${
              viewMode === 'list' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-black'
            }`}
          >
            <span className="hidden sm:inline">リスト</span>
            <span className="sm:hidden">📝</span>
          </button>
        </div>
      </div>

      {viewMode === 'board' && !showCompleted ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className={`p-3 ${column.color} rounded-t`}>
                <h3 className="font-semibold flex items-center gap-2">
                  <column.icon className="h-4 w-4" />
                  {column.title}
                  <span className="ml-auto text-sm font-normal bg-white px-2 py-0.5 rounded">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </span>
                </h3>
              </div>
              <div className="space-y-3">
                {filteredTasks
                  .filter(task => task.status === column.id)
                  .map((task) => (
                    <Card key={task.id} className="group hover:border-gray-400 transition-colors">
                      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <Link href={`/tasks/${task.id}`} className="flex-1">
                              <h4 className="font-medium text-sm hover:text-gray-600 transition-colors">{task.title}</h4>
                            </Link>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Link href={`/tasks/${task.id}`}>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <Eye className="h-3 w-3" />
                                </button>
                              </Link>
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => task.id && handleDeleteTask(task.id)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">
                            {task.project?.name}
                            {task.project?.client_name && ` (${task.project.client_name})`}
                          </p>
                          {task.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {task.description.length > 30 
                                ? `${task.description.substring(0, 30)}...` 
                                : task.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => task.id && handleStatusChange(task.id, e.target.value as 'todo' | 'in_progress' | 'review' | 'completed')}
                            className="text-xs px-1 py-0.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                          >
                            <option value="todo">未着手</option>
                            <option value="in_progress">進行中</option>
                            <option value="review">レビュー</option>
                            <option value="completed">完了</option>
                          </select>
                          <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(task.priority || 'medium')}`}>
                            {task.priority === 'urgent' ? '緊急' :
                             task.priority === 'high' ? '高' :
                             task.priority === 'medium' ? '中' : '低'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{task.assignee || '未割当'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('ja-JP') : '期日なし'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'board' && showCompleted ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:border-gray-400 transition-colors">
              <CardContent className="p-3 sm:p-4 space-y-2">
                <div className="space-y-1">
                  <Link href={`/tasks/${task.id}`}>
                    <h4 className="font-medium text-sm hover:text-gray-600 transition-colors">{task.title}</h4>
                  </Link>
                  <p className="text-xs text-gray-600">
                    {task.project?.name}
                    {task.project?.client_name && ` (${task.project.client_name})`}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>完了: {task.updated_at ? new Date(task.updated_at).toLocaleDateString('ja-JP') : '不明'}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => task.id && handleStatusChange(task.id, 'todo')}
                      className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      再開
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:border-gray-400 transition-colors group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => task.id && handleStatusChange(task.id, e.target.value as 'todo' | 'in_progress' | 'review' | 'completed')}
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:border-black focus:outline-none"
                      >
                        <option value="todo">未着手</option>
                        <option value="in_progress">進行中</option>
                        <option value="review">レビュー</option>
                        <option value="completed">完了</option>
                      </select>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(task.priority || 'medium')}`}>
                        {task.priority === 'urgent' ? '緊急' :
                         task.priority === 'high' ? '高' :
                         task.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <Link href={`/tasks/${task.id}`}>
                        <h4 className="font-medium hover:text-gray-600 transition-colors">{task.title}</h4>
                      </Link>
                      <div className="text-sm text-gray-600">
                        <p>
                          {task.project?.name}
                          {task.project?.client_name && ` (${task.project.client_name})`}
                        </p>
                        {task.description && (
                          <p className="text-gray-500">
                            {task.description.length > 30 
                              ? `${task.description.substring(0, 30)}...` 
                              : task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    <div className="text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{task.assignee || '未割当'}</span>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('ja-JP') : '期日なし'}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-auto sm:ml-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/tasks/${task.id}`}>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="h-3 w-3" />
                        </button>
                      </Link>
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => task.id && handleDeleteTask(task.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isTaskModalOpen}
        onClose={closeModal}
        title={editingTask ? 'タスクを編集' : '新規タスク'}
      >
        <TaskForm
          task={editingTask}
          onClose={closeModal}
        />
      </Modal>
    </div>
  )
}