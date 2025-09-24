'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Globe,
  Plus,
  Calendar,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  X,
  Save,
  AlertCircle
} from 'lucide-react'
import { getDomains, createDomain, updateDomain, deleteDomain, type Domain } from '@/lib/supabase/domains'
import { getProjects, type Project } from '@/lib/supabase/projects'

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState<Partial<Domain>>({
    domain_name: '',
    project_id: '',
    contract_date: '',
    contract_period: 1,
    domain_user_id: '',
    domain_password: '',
    registrar: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [domainsData, projectsData] = await Promise.all([
        getDomains(),
        getProjects()
      ])
      setDomains(domainsData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingDomain) {
        await updateDomain(editingDomain.id!, formData)
      } else {
        await createDomain(formData as Omit<Domain, 'id' | 'created_at' | 'updated_at' | 'renewal_date'>)
      }

      await fetchData()
      setShowForm(false)
      setEditingDomain(null)
      setFormData({
        domain_name: '',
        project_id: '',
        contract_date: '',
        contract_period: 1,
        domain_user_id: '',
        domain_password: '',
        registrar: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error saving domain:', error)
      alert('ドメインの保存に失敗しました')
    }
  }

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain)
    setFormData({
      domain_name: domain.domain_name,
      project_id: domain.project_id || '',
      contract_date: domain.contract_date,
      contract_period: domain.contract_period,
      domain_user_id: domain.domain_user_id || '',
      domain_password: domain.domain_password || '',
      registrar: domain.registrar || '',
      notes: domain.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このドメインを削除しますか？')) return

    try {
      await deleteDomain(id)
      await fetchData()
    } catch (error) {
      console.error('Error deleting domain:', error)
      alert('ドメインの削除に失敗しました')
    }
  }

  const togglePasswordVisibility = (domainId: string) => {
    setShowPasswords(prev => ({ ...prev, [domainId]: !prev[domainId] }))
  }

  const filteredDomains = domains.filter(domain =>
    domain.domain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.registrar?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDaysUntilRenewal = (renewalDate: string) => {
    const renewal = new Date(renewalDate)
    const today = new Date()
    const diffTime = renewal.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getRenewalWarningClass = (days: number) => {
    if (days <= 30) return 'text-red-600 font-bold'
    if (days <= 90) return 'text-orange-600 font-semibold'
    if (days <= 180) return 'text-yellow-600'
    return 'text-gray-600'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ドメイン管理</h1>
          <p className="text-gray-600 mt-1">プロジェクトのドメインを管理</p>
        </div>
        <Button
          onClick={() => {
            setEditingDomain(null)
            setFormData({
              domain_name: '',
              project_id: '',
              contract_date: '',
              contract_period: 1,
              domain_user_id: '',
              domain_password: '',
              registrar: '',
              notes: ''
            })
            setShowForm(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          ドメインを追加
        </Button>
      </div>

      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="ドメイン名、プロジェクト名、レジストラで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 期限が近いドメインの警告 */}
      {domains.some(d => d.renewal_date && getDaysUntilRenewal(d.renewal_date) <= 30) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">更新期限が近いドメインがあります</p>
            <p className="text-sm text-red-700 mt-1">
              30日以内に更新が必要なドメインを確認してください。
            </p>
          </div>
        </div>
      )}

      {/* ドメインリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDomains.map((domain) => {
          const daysUntilRenewal = domain.renewal_date ? getDaysUntilRenewal(domain.renewal_date) : null

          return (
            <Card key={domain.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <span className="truncate">{domain.domain_name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(domain)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(domain.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {domain.project?.name && (
                  <div>
                    <p className="text-xs text-gray-600">プロジェクト</p>
                    <p className="font-medium">{domain.project.name}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">契約日</p>
                    <p>{new Date(domain.contract_date).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">契約期間</p>
                    <p>{domain.contract_period}年</p>
                  </div>
                </div>

                {domain.renewal_date && daysUntilRenewal !== null && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Calendar className="h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">次回更新日</p>
                      <p className="text-sm font-medium">
                        {new Date(domain.renewal_date).toLocaleDateString('ja-JP')}
                      </p>
                      <p className={`text-xs ${getRenewalWarningClass(daysUntilRenewal)}`}>
                        {daysUntilRenewal > 0 ? `あと${daysUntilRenewal}日` : '期限切れ'}
                      </p>
                    </div>
                  </div>
                )}

                {domain.registrar && (
                  <div>
                    <p className="text-xs text-gray-600">レジストラ</p>
                    <p className="text-sm">{domain.registrar}</p>
                  </div>
                )}

                {domain.domain_user_id && (
                  <div>
                    <p className="text-xs text-gray-600">ドメインID</p>
                    <p className="text-sm font-mono">{domain.domain_user_id}</p>
                  </div>
                )}

                {domain.domain_password && (
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      パスワード
                      <button
                        onClick={() => togglePasswordVisibility(domain.id!)}
                        className="hover:text-gray-900"
                      >
                        {showPasswords[domain.id!] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                    </p>
                    <p className="text-sm font-mono">
                      {showPasswords[domain.id!] ? domain.domain_password : '••••••••'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredDomains.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">ドメインが見つかりません</p>
        </div>
      )}

      {/* 追加・編集フォーム */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingDomain ? 'ドメインを編集' : 'ドメインを追加'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setEditingDomain(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="domain_name">ドメイン名 *</Label>
                <Input
                  id="domain_name"
                  value={formData.domain_name}
                  onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
                  placeholder="example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="project_id">プロジェクト</Label>
                <select
                  id="project_id"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">プロジェクトを選択</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contract_date">契約日 *</Label>
                  <Input
                    id="contract_date"
                    type="date"
                    value={formData.contract_date}
                    onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contract_period">契約期間（年） *</Label>
                  <Input
                    id="contract_period"
                    type="number"
                    min="1"
                    value={formData.contract_period}
                    onChange={(e) => setFormData({ ...formData, contract_period: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="registrar">レジストラ</Label>
                <Input
                  id="registrar"
                  value={formData.registrar}
                  onChange={(e) => setFormData({ ...formData, registrar: e.target.value })}
                  placeholder="お名前.com、ムームードメインなど"
                />
              </div>

              <div>
                <Label htmlFor="domain_user_id">ドメイン管理ID</Label>
                <Input
                  id="domain_user_id"
                  value={formData.domain_user_id}
                  onChange={(e) => setFormData({ ...formData, domain_user_id: e.target.value })}
                  placeholder="管理画面のログインID"
                />
              </div>

              <div>
                <Label htmlFor="domain_password">パスワード</Label>
                <Input
                  id="domain_password"
                  type="password"
                  value={formData.domain_password}
                  onChange={(e) => setFormData({ ...formData, domain_password: e.target.value })}
                  placeholder="管理画面のパスワード"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ※ セキュリティのため、パスワードは暗号化して保存されることを推奨します
                </p>
              </div>

              <div>
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="追加情報やメモ"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingDomain(null)
                  }}
                >
                  キャンセル
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  保存
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}