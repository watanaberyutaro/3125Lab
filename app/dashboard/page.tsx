'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  FolderOpen, 
  Users, 
  CheckSquare, 
  AlertCircle,
  Clock,
  Activity,
  Calendar,
  Globe,
  Shield,
  FileText,
  Server,
  ListTodo
} from 'lucide-react'
import { getProjects } from '@/lib/supabase/projects'
import { getClients } from '@/lib/supabase/clients'
import { getTasks } from '@/lib/supabase/tasks'
import type { Project } from '@/lib/supabase/projects'
import type { Client } from '@/lib/supabase/clients'
import type { TaskWithProject } from '@/lib/supabase/tasks'
import { InfrastructureNotifications } from '@/components/dashboard/infrastructure-notifications'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [projectsData, clientsData, tasksData] = await Promise.all([
        getProjects(),
        getClients(),
        getTasks()
      ])
      setProjects(projectsData)
      setClients(clientsData)
      setTasks(tasksData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 統計データを計算
  const stats = [
    {
      title: '稼働中プロジェクト',
      value: projects.filter(p => p.status === 'development' || p.status === 'production').length.toString(),
      icon: FolderOpen,
      change: `総数 ${projects.length}件`,
      trend: 'up'
    },
    {
      title: 'クライアント総数',
      value: clients.length.toString(),
      icon: Users,
      change: clients.length > 0 ? `アクティブ ${clients.length}社` : '登録なし',
      trend: 'up'
    },
    {
      title: 'プロジェクト進捗',
      value: projects.length > 0 
        ? `${Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)}%`
        : '0%',
      icon: CheckSquare,
      change: '平均進捗率',
      trend: 'neutral'
    },
    {
      title: '今月の締切',
      value: [...tasks.filter(t => {
        if (!t.due_date) return false
        const dueDate = new Date(t.due_date)
        const now = new Date()
        return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear() && t.status !== 'completed'
      }), ...projects.filter(p => {
        if (!p.end_date) return false
        const endDate = new Date(p.end_date)
        const now = new Date()
        return endDate.getMonth() === now.getMonth() && endDate.getFullYear() === now.getFullYear()
      })].length.toString(),
      icon: AlertCircle,
      change: '今月中のタスク・プロジェクト',
      trend: tasks.filter(t => t.due_date && t.status !== 'completed').length > 0 ? 'warning' : 'neutral'
    },
  ]

  // 最近のプロジェクト（最大4件）
  const recentProjects = projects.slice(0, 4)

  // 今後の締切（タスクとプロジェクトの両方から取得）
  const upcomingDeadlines = [
    // タスクの期日
    ...tasks
      .filter(t => t.due_date && new Date(t.due_date) > new Date() && t.status !== 'completed')
      .map(t => ({
        item: t.title,
        date: t.due_date!,
        type: 'task' as const,
        priority: t.priority,
        assignee: t.assignee,
        project: t.project?.name
      })),
    // プロジェクトの終了日
    ...projects
      .filter(p => p.end_date && new Date(p.end_date) > new Date())
      .map(p => ({
        item: `${p.name} - プロジェクト完了`,
        date: p.end_date!,
        type: 'project' as const,
        priority: 'medium',
        assignee: null,
        project: null
      }))
  ]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8) // 表示件数を増やす

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return ListTodo
      case 'project': return FileText
      case 'domain': return Globe
      case 'ssl': return Shield
      case 'server': return Server
      case 'contract': return Calendar
      default: return Clock
    }
  }

  const getTypeColor = (type: string, priority?: string) => {
    if (type === 'task') {
      switch (priority) {
        case 'urgent': return 'bg-gray-900'
        case 'high': return 'bg-gray-700'
        case 'medium': return 'bg-gray-500'
        case 'low': return 'bg-gray-300'
        default: return 'bg-gray-400'
      }
    }
    switch (type) {
      case 'project': return 'bg-gray-500'
      case 'domain': return 'bg-gray-200'
      case 'ssl': return 'bg-gray-100'
      case 'server': return 'bg-gray-500'
      case 'contract': return 'bg-gray-600'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800'
      case 'development': return 'bg-gray-50 text-black'
      case 'production': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-black text-white'
      case 'completed': return 'bg-gray-200 text-gray-900'
      default: return 'bg-gray-50 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return '企画中'
      case 'development': return '開発中'
      case 'production': return '本番稼働中'
      case 'maintenance': return '保守中'
      case 'completed': return '完了'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-gray-600 mt-1">3125Labへようこそ</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={cn(
                "text-xs mt-1",
                stat.trend === 'up' && "text-gray-800",
                stat.trend === 'warning' && "text-gray-700",
                stat.trend === 'neutral' && "text-gray-600"
              )}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="relative z-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              最近のプロジェクト
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-600">
                          {project.client_name || 'クライアント未設定'}
                        </p>
                      </div>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        getStatusBadge(project.status)
                      )}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-900 h-2 rounded-full"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                プロジェクトがありません
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="relative z-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              今後の期限
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => {
                  const Icon = getTypeIcon(deadline.type)
                  const daysLeft = Math.ceil((new Date(deadline.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={cn(
                          "p-2 rounded-lg",
                          getTypeColor(deadline.type, deadline.priority)
                        )}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{deadline.item}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{new Date(deadline.date).toLocaleDateString('ja-JP')}</span>
                            {deadline.assignee && (
                              <>
                                <span>•</span>
                                <span>{deadline.assignee}</span>
                              </>
                            )}
                            {deadline.project && (
                              <>
                                <span>•</span>
                                <span>{deadline.project}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-xs font-medium",
                          daysLeft <= 3 ? "text-gray-900" : 
                          daysLeft <= 7 ? "text-gray-700" : 
                          "text-gray-500"
                        )}>
                          {daysLeft === 0 ? '今日' : 
                           daysLeft === 1 ? '明日' :
                           `${daysLeft}日後`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                今後の期限はありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* インフラ更新通知セクション */}
      <InfrastructureNotifications />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月間収入概要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">プロジェクト数</span>
                <span className="font-bold">{projects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">アクティブクライアント</span>
                <span className="font-bold">{clients.length}</span>
              </div>
              <div className="border-t pt-4">
                <p className="text-xs text-gray-800">データ同期済み</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>システムステータス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">データベース</span>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">同期状態</span>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  接続中
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">最終更新</span>
                <span className="text-xs text-gray-600">
                  {new Date().toLocaleTimeString('ja-JP')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}