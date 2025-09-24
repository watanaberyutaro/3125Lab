'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Server,
  Globe,
  Calendar,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ServerForm } from './server-form'
import { DomainForm } from './domain-form'

interface InfrastructureSectionProps {
  projectId: string
}

interface Server {
  id: string
  project_id: string
  server_name: string
  server_type: string
  provider: string
  hostname: string
  ip_address: string
  ssh_port: number
  ssh_username: string
  ssh_password: string
  control_panel_url: string
  control_panel_username: string
  control_panel_password: string
  monthly_cost: number
  renewal_date: string
  notes: string
}

interface Domain {
  id: string
  project_id: string
  domain_name: string
  registrar: string
  registrar_url: string
  registrar_username: string
  registrar_password: string
  dns_provider: string
  expiry_date: string
  auto_renew: boolean
  ssl_expiry_date: string
  yearly_cost: number
  notes: string
}

export function InfrastructureSection({ projectId }: InfrastructureSectionProps) {
  const [servers, setServers] = useState<Server[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [showServerForm, setShowServerForm] = useState(false)
  const [showDomainForm, setShowDomainForm] = useState(false)
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchInfrastructureData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const fetchInfrastructureData = async () => {
    setLoading(true)
    try {
      const [serversResponse, domainsResponse] = await Promise.all([
        supabase
          .from('project_servers')
          .select('*')
          .eq('project_id', projectId),
        supabase
          .from('project_domains')
          .select('*')
          .eq('project_id', projectId)
      ])

      if (serversResponse.data) setServers(serversResponse.data)
      if (domainsResponse.data) setDomains(domainsResponse.data)
    } catch (error) {
      console.error('Error fetching infrastructure data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteServer = async (id: string) => {
    if (!confirm('このサーバー情報を削除しますか？')) return

    const { error } = await supabase
      .from('project_servers')
      .delete()
      .eq('id', id)

    if (!error) {
      setServers(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleDeleteDomain = async (id: string) => {
    if (!confirm('このドメイン情報を削除しますか？')) return

    const { error } = await supabase
      .from('project_domains')
      .delete()
      .eq('id', id)

    if (!error) {
      setDomains(prev => prev.filter(d => d.id !== id))
    }
  }

  const getDaysUntilExpiry = (dateString: string) => {
    const expiry = new Date(dateString)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryWarningClass = (days: number) => {
    if (days <= 7) return 'text-red-600 font-bold'
    if (days <= 30) return 'text-orange-600 font-semibold'
    if (days <= 90) return 'text-yellow-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-gray-500">読み込み中...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* サーバー情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              サーバー情報
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingServer(null)
                setShowServerForm(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {servers.length > 0 ? (
            <div className="space-y-4">
              {servers.map((server) => (
                <div key={server.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{server.server_name}</h4>
                      <p className="text-sm text-gray-600">
                        {server.provider} - {server.server_type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingServer(server)
                          setShowServerForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteServer(server.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">ホスト名</p>
                      <p className="font-mono">{server.hostname || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">IPアドレス</p>
                      <p className="font-mono">{server.ip_address || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">SSH接続</p>
                      <p className="font-mono">
                        {server.ssh_username}@{server.hostname}:{server.ssh_port}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">月額費用</p>
                      <p className="font-medium">
                        {server.monthly_cost ? `¥${server.monthly_cost.toLocaleString()}` : '-'}
                      </p>
                    </div>
                  </div>

                  {server.control_panel_url && (
                    <div className="flex items-center gap-2 pt-2">
                      <Shield className="h-4 w-4 text-gray-600" />
                      <a
                        href={server.control_panel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        管理画面
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {server.renewal_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span>更新日: {new Date(server.renewal_date).toLocaleDateString('ja-JP')}</span>
                      {(() => {
                        const days = getDaysUntilExpiry(server.renewal_date)
                        return (
                          <span className={getExpiryWarningClass(days)}>
                            ({days > 0 ? `あと${days}日` : '期限切れ'})
                          </span>
                        )
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">サーバー情報は登録されていません</p>
          )}
        </CardContent>
      </Card>

      {/* ドメイン情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              ドメイン情報
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingDomain(null)
                setShowDomainForm(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {domains.length > 0 ? (
            <div className="space-y-4">
              {domains.map((domain) => (
                <div key={domain.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{domain.domain_name}</h4>
                      <p className="text-sm text-gray-600">
                        {domain.registrar} {domain.auto_renew && '（自動更新）'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingDomain(domain)
                          setShowDomainForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDomain(domain.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">DNS プロバイダー</p>
                      <p>{domain.dns_provider || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">年額費用</p>
                      <p className="font-medium">
                        {domain.yearly_cost ? `¥${domain.yearly_cost.toLocaleString()}` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span>ドメイン有効期限: {new Date(domain.expiry_date).toLocaleDateString('ja-JP')}</span>
                      {(() => {
                        const days = getDaysUntilExpiry(domain.expiry_date)
                        return (
                          <span className={getExpiryWarningClass(days)}>
                            ({days > 0 ? `あと${days}日` : '期限切れ'})
                          </span>
                        )
                      })()}
                    </div>

                    {domain.ssl_expiry_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-gray-600" />
                        <span>SSL証明書期限: {new Date(domain.ssl_expiry_date).toLocaleDateString('ja-JP')}</span>
                        {(() => {
                          const days = getDaysUntilExpiry(domain.ssl_expiry_date)
                          return (
                            <span className={getExpiryWarningClass(days)}>
                              ({days > 0 ? `あと${days}日` : '期限切れ'})
                            </span>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  {domain.registrar_url && (
                    <div className="flex items-center gap-2">
                      <a
                        href={domain.registrar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        管理画面
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">ドメイン情報は登録されていません</p>
          )}
        </CardContent>
      </Card>

      {/* フォームモーダル */}
      {showServerForm && (
        <ServerForm
          projectId={projectId}
          server={editingServer}
          onClose={() => {
            setShowServerForm(false)
            setEditingServer(null)
          }}
          onSave={() => {
            setShowServerForm(false)
            setEditingServer(null)
            fetchInfrastructureData()
          }}
        />
      )}

      {showDomainForm && (
        <DomainForm
          projectId={projectId}
          domain={editingDomain}
          onClose={() => {
            setShowDomainForm(false)
            setEditingDomain(null)
          }}
          onSave={() => {
            setShowDomainForm(false)
            setEditingDomain(null)
            fetchInfrastructureData()
          }}
        />
      )}
    </div>
  )
}