'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { createProject, updateProject, type Project } from '@/lib/supabase/projects'

interface ProjectFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  project?: Project
}

export function ProjectForm({ open, onClose, onSuccess, project }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    client_name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    production_url: '',
    staging_url: '',
    development_url: '',
    repository_url: '',
    progress: 0,
    development_fee: 0,
    monthly_revenue: 0,
    monthly_cost: 0
  })

  // プロジェクトデータが変更されたとき、またはモーダルが開かれたときにフォームを初期化
  useEffect(() => {
    if (open) {
      if (project) {
        // 編集モード: 既存のプロジェクトデータをセット
        setFormData({
          name: project.name || '',
          client_name: project.client_name || '',
          description: project.description || '',
          status: project.status || 'planning',
          priority: project.priority || 'medium',
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          production_url: project.production_url || '',
          staging_url: project.staging_url || '',
          development_url: project.development_url || '',
          repository_url: project.repository_url || '',
          progress: project.progress || 0,
          development_fee: project.development_fee || 0,
          monthly_revenue: project.monthly_revenue || 0,
          monthly_cost: project.monthly_cost || 0
        })
      } else {
        // 新規作成モード: フォームをリセット
        setFormData({
          name: '',
          client_name: '',
          description: '',
          status: 'planning',
          priority: 'medium',
          start_date: '',
          end_date: '',
          production_url: '',
          staging_url: '',
          development_url: '',
          repository_url: '',
          progress: 0,
          development_fee: 0,
          monthly_revenue: 0,
          monthly_cost: 0
        })
      }
      setError(null)
    }
  }, [open, project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const projectData = {
        ...formData,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        production_url: formData.production_url || undefined,
        staging_url: formData.staging_url || undefined,
        development_url: formData.development_url || undefined,
        repository_url: formData.repository_url || undefined,
        progress: formData.progress || 0,
        development_fee: formData.development_fee || 0,
        monthly_revenue: formData.monthly_revenue || 0,
        monthly_cost: formData.monthly_cost || 0
      }
      
      if (project?.id) {
        await updateProject(project.id, projectData)
      } else {
        await createProject(projectData)
      }
      
      onSuccess()
      onClose()
    } catch (err: unknown) {
      console.error('Error saving project:', err)
      const errorMessage = err instanceof Error ? err.message : 'プロジェクトの保存に失敗しました。もう一度お試しください。'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={project ? 'プロジェクト編集' : '新規プロジェクト'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">プロジェクト名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="client_name">クライアント</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">ステータス</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="planning">企画中</option>
              <option value="development">開発中</option>
              <option value="production">本番稼働中</option>
              <option value="maintenance">保守中</option>
              <option value="completed">完了</option>
              <option value="archived">アーカイブ</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">優先度</Label>
            <Select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">緊急</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">開始日</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="end_date">終了日</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="progress">進捗 ({formData.progress}%)</Label>
          <Input
            id="progress"
            type="range"
            min="0"
            max="100"
            step="5"
            value={formData.progress}
            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="production_url">本番URL</Label>
            <Input
              id="production_url"
              type="url"
              value={formData.production_url}
              onChange={(e) => setFormData({ ...formData, production_url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label htmlFor="staging_url">ステージングURL</Label>
            <Input
              id="staging_url"
              type="url"
              value={formData.staging_url}
              onChange={(e) => setFormData({ ...formData, staging_url: e.target.value })}
              placeholder="https://staging.example.com"
            />
          </div>
          <div>
            <Label htmlFor="development_url">開発URL</Label>
            <Input
              id="development_url"
              type="url"
              value={formData.development_url}
              onChange={(e) => setFormData({ ...formData, development_url: e.target.value })}
              placeholder="https://dev.example.com"
            />
          </div>
          <div>
            <Label htmlFor="repository_url">リポジトリURL</Label>
            <Input
              id="repository_url"
              type="url"
              value={formData.repository_url}
              onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium">財務情報</h3>
          
          <div>
            <Label htmlFor="development_fee">制作費用（一括）</Label>
            <div className="flex items-center gap-2">
              <Input
                id="development_fee"
                type="number"
                value={formData.development_fee}
                onChange={(e) => setFormData({ ...formData, development_fee: parseInt(e.target.value) || 0 })}
                min="0"
              />
              <span className="text-sm">円</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthly_revenue">月額収入（クライアント）</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="monthly_revenue"
                  type="number"
                  value={formData.monthly_revenue}
                  onChange={(e) => setFormData({ ...formData, monthly_revenue: parseInt(e.target.value) || 0 })}
                  min="0"
                />
                <span className="text-sm">円/月</span>
              </div>
            </div>
            <div>
              <Label htmlFor="monthly_cost">月額支出（維持費）</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="monthly_cost"
                  type="number"
                  value={formData.monthly_cost}
                  onChange={(e) => setFormData({ ...formData, monthly_cost: parseInt(e.target.value) || 0 })}
                  min="0"
                />
                <span className="text-sm">円/月</span>
              </div>
            </div>
          </div>

          {(formData.monthly_revenue > 0 || formData.monthly_cost > 0) && (
            <div className="bg-gray-50 p-3 rounded">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>月額利益:</span>
                  <span className={`font-medium ${(formData.monthly_revenue - formData.monthly_cost) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ¥{(formData.monthly_revenue - formData.monthly_cost).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>年間利益予測:</span>
                  <span className={`font-medium ${((formData.monthly_revenue - formData.monthly_cost) * 12) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ¥{((formData.monthly_revenue - formData.monthly_cost) * 12).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-gray-50 text-gray-900 text-sm rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : (project ? '更新' : '作成')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}