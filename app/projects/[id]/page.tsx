'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getProject, type Project } from '@/lib/supabase/projects'
import { getTasksByProject } from '@/lib/supabase/tasks'
import type { Task } from '@/lib/supabase/tasks'
import { 
  ArrowLeft,
  Edit,
  ExternalLink,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Circle,
  Github,
  Globe,
  Server,
  DollarSign,
  TrendingUp,
  Wallet
} from 'lucide-react'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProjectData(params.id as string)
    }
  }, [params.id])

  const fetchProjectData = async (id: string) => {
    setLoading(true)
    try {
      const [projectData, tasksData] = await Promise.all([
        getProject(id),
        getTasksByProject(id)
      ])
      setProject(projectData)
      setTasks(tasksData)
    } catch (error) {
      console.error('Error fetching project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800'
      case 'development': return 'bg-gray-50 text-black'
      case 'production': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-gray-50 text-gray-700'
      case 'completed': return 'bg-gray-200 text-gray-900'
      case 'archived': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'planning': '企画中',
      'development': '開発中',
      'production': '本番稼働中',
      'maintenance': '保守中',
      'completed': '完了',
      'archived': 'アーカイブ'
    }
    return statusMap[status] || status
  }

  const getPriorityLabel = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'urgent': '緊急',
      'high': '高',
      'medium': '中',
      'low': '低'
    }
    return priorityMap[priority] || priority
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Circle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'review': return <AlertCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Circle className="h-4 w-4" />
    }
  }

  const getTaskStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'todo': '未着手',
      'in_progress': '進行中',
      'review': 'レビュー',
      'completed': '完了'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">プロジェクトが見つかりません</div>
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
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>
        <Link href={`/projects?edit=${project.id}`}>
          <Button className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            編集
          </Button>
        </Link>
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
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">優先度</p>
                  <p className="font-medium">{getPriorityLabel(project.priority)}</p>
                </div>
              </div>
              
              {project.description && (
                <div>
                  <p className="text-sm text-gray-600">説明</p>
                  <p className="mt-1">{project.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">開始日</p>
                  <p className="font-medium">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString('ja-JP') : '未定'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">終了日</p>
                  <p className="font-medium">
                    {project.end_date ? new Date(project.end_date).toLocaleDateString('ja-JP') : '未定'}
                  </p>
                </div>
              </div>

              {project.client_name && (
                <div>
                  <p className="text-sm text-gray-600">クライアント</p>
                  <p className="font-medium">{project.client_name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 進捗 */}
          <Card>
            <CardHeader>
              <CardTitle>進捗状況</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">全体進捗</span>
                  <span className="font-medium">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gray-900 h-3 rounded-full transition-all"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* タスク一覧 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>関連タスク</span>
                <span className="text-sm font-normal text-gray-600">{tasks.length}件</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-black rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTaskStatusIcon(task.status)}
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{getTaskStatusLabel(task.status)}</span>
                            {task.assignee && (
                              <>
                                <span>•</span>
                                <span>{task.assignee}</span>
                              </>
                            )}
                            {task.due_date && (
                              <>
                                <span>•</span>
                                <span>{new Date(task.due_date).toLocaleDateString('ja-JP')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">タスクはまだありません</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 財務情報 */}
          {(project.development_fee || project.monthly_revenue || project.monthly_cost) ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  財務情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.development_fee ? (
                  <div>
                    <p className="text-sm text-gray-600">制作費用</p>
                    <p className="text-xl font-bold">
                      ¥{project.development_fee.toLocaleString()}
                    </p>
                  </div>
                ) : null}
                
                {(project.monthly_revenue || project.monthly_cost) ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">月額収入</p>
                        <p className="font-medium">
                          ¥{(project.monthly_revenue || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">月額支出</p>
                        <p className="font-medium">
                          ¥{(project.monthly_cost || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">月額利益</span>
                          <span className={`font-bold ${((project.monthly_revenue || 0) - (project.monthly_cost || 0)) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            ¥{((project.monthly_revenue || 0) - (project.monthly_cost || 0)).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">年間利益予測</span>
                          <span className={`font-bold ${(((project.monthly_revenue || 0) - (project.monthly_cost || 0)) * 12) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            ¥{(((project.monthly_revenue || 0) - (project.monthly_cost || 0)) * 12).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {project.start_date && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600">運用期間</p>
                        <p className="font-medium">
                          {(() => {
                            const start = new Date(project.start_date)
                            const now = new Date()
                            const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
                            return months > 0 ? `${months}ヶ月` : '開始前'
                          })()}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">累計収益（推定）</p>
                        <p className="font-bold text-lg">
                          {(() => {
                            const start = new Date(project.start_date)
                            const now = new Date()
                            const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
                            const total = (project.development_fee || 0) + (months > 0 ? months * ((project.monthly_revenue || 0) - (project.monthly_cost || 0)) : 0)
                            return `¥${total.toLocaleString()}`
                          })()}
                        </p>
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {/* URL情報 */}
          <Card>
            <CardHeader>
              <CardTitle>URL情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.production_url && (
                <a
                  href={project.production_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">本番環境</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </a>
              )}
              
              {project.staging_url && (
                <a
                  href={project.staging_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    <span className="text-sm">ステージング</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </a>
              )}
              
              {project.development_url && (
                <a
                  href={project.development_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    <span className="text-sm">開発環境</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </a>
              )}
              
              {project.repository_url && (
                <a
                  href={project.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    <span className="text-sm">リポジトリ</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </a>
              )}
              
              {!project.production_url && !project.staging_url && !project.development_url && !project.repository_url && (
                <p className="text-gray-500 text-sm text-center py-2">URLは登録されていません</p>
              )}
            </CardContent>
          </Card>

          {/* タイムライン */}
          <Card>
            <CardHeader>
              <CardTitle>タイムライン</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {project.created_at && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-gray-600">作成日</p>
                      <p className="font-medium">
                        {new Date(project.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                )}
                
                {project.start_date && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-gray-600">開始日</p>
                      <p className="font-medium">
                        {new Date(project.start_date).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                )}
                
                {project.end_date && (
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      project.status === 'completed' ? 'bg-gray-900' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-600">終了予定日</p>
                      <p className="font-medium">
                        {new Date(project.end_date).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}