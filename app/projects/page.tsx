'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectForm } from '@/components/forms/project-form'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { getProjects, deleteProject, type Project } from '@/lib/supabase/projects'
import { 
  Plus, 
  Search, 
  MoreVertical,
  ExternalLink,
  Edit,
  Trash2,
  FolderOpen,
  Eye
} from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('すべて')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; project: Project | null }>({
    open: false,
    project: null
  })
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  useEffect(() => {
    loadProjects()
  }, [])
  
  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteConfirm = async () => {
    if (!deleteModal.project?.id) return
    
    setDeleteLoading(true)
    try {
      await deleteProject(deleteModal.project.id)
      await loadProjects()
      setDeleteModal({ open: false, project: null })
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('プロジェクトの削除に失敗しました')
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (project.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const statusMap: { [key: string]: string } = {
      'planning': '企画中',
      'development': '開発中',
      'production': '本番稼働中',
      'maintenance': '保守中',
      'completed': '完了',
      'archived': 'アーカイブ'
    }
    const projectStatus = statusMap[project.status] || project.status
    const matchesStatus = filterStatus === 'すべて' || projectStatus === filterStatus
    return matchesSearch && matchesStatus
  })

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-gray-900'
      case 'high': return 'text-gray-600'
      case 'medium': return 'text-gray-700'
      case 'low': return 'text-gray-800'
      default: return 'text-gray-600'
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">プロジェクト</h1>
          <p className="text-gray-600 mt-1">プロジェクトの管理と進捗追跡</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => {
          setSelectedProject(undefined)
          setIsFormOpen(true)
        }}>
          <Plus className="h-4 w-4" />
          新規プロジェクト
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="プロジェクトを検索..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['すべて', '企画中', '開発中', '本番稼働中', '保守中'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-sm capitalize transition-colors ${
                filterStatus === status 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-black'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">プロジェクトが見つかりません</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:border-gray-400 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    {project.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{project.client_name || '未設定'}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
              
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
                <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  優先度: {getPriorityLabel(project.priority)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">進捗</span>
                  <span className="font-medium">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-900 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>{project.start_date || '開始日未定'} - {project.end_date || '終了日未定'}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-black">
                <Link href={`/projects/${project.id}`}>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                    <Eye className="h-3 w-3" />
                    詳細
                  </Button>
                </Link>
                {project.production_url && (
                  <a href={project.production_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                      <ExternalLink className="h-3 w-3" />
                      サイト
                    </Button>
                  </a>
                )}
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs" onClick={() => {
                  setSelectedProject(project)
                  setIsFormOpen(true)
                }}>
                  <Edit className="h-3 w-3" />
                  編集
                </Button>
                <Button variant="ghost" size="sm" 
                  className="flex items-center gap-1 text-xs text-gray-900 hover:text-gray-700"
                  onClick={() => setDeleteModal({ open: true, project })}
                >
                  <Trash2 className="h-3 w-3" />
                  削除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
      
      <ProjectForm 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false)
          loadProjects()
        }}
        project={selectedProject}
      />
      
      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, project: null })}
        onConfirm={handleDeleteConfirm}
        projectName={deleteModal.project?.name || ''}
        loading={deleteLoading}
      />
    </div>
  )
}