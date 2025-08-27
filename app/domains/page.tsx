'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Globe, AlertCircle, CheckCircle, ExternalLink, Plus } from 'lucide-react'

interface Domain {
  id: string
  name: string
  registrar: string
  expire_date: string
  status: 'active' | 'expiring' | 'expired'
  project_id?: string
  project_name?: string
  auto_renew: boolean
  dns_provider?: string
  ssl_expire_date?: string
}

export default function DomainsPage() {
  const [domains] = useState<Domain[]>([
    {
      id: '1',
      name: 'example.com',
      registrar: 'お名前.com',
      expire_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'expiring',
      project_name: 'ECプラットフォーム',
      auto_renew: false,
      dns_provider: 'Cloudflare',
      ssl_expire_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      id: '2',
      name: 'client-site.jp',
      registrar: 'Value-Domain',
      expire_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      project_name: 'コーポレートサイト',
      auto_renew: true,
      dns_provider: 'Route 53',
      ssl_expire_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ])
  const [searchQuery, setSearchQuery] = useState('')

  const getDaysUntilExpiry = (expireDate: string) => {
    const today = new Date()
    const expire = new Date(expireDate)
    const diffTime = expire.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expiring': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ドメイン管理</h1>
          <p className="text-gray-600 mt-1">管理中のドメインと更新期限</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          ドメイン追加
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          type="search"
          placeholder="ドメイン名またはプロジェクト名で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDomains.map(domain => {
          const daysUntil = getDaysUntilExpiry(domain.expire_date)
          return (
            <Card key={domain.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <CardTitle className="text-lg">{domain.name}</CardTitle>
                  </div>
                  <a href={`https://${domain.name}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ステータス</span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(domain.status)}`}>
                    {domain.status === 'active' ? 'アクティブ' : 
                     domain.status === 'expiring' ? '期限間近' : '期限切れ'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">更新期限</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">{domain.expire_date}</p>
                    <p className={`text-xs ${daysUntil <= 30 ? 'text-red-600' : 'text-gray-500'}`}>
                      {daysUntil > 0 ? `あと${daysUntil}日` : '期限切れ'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">レジストラ</span>
                  <span className="text-sm">{domain.registrar}</span>
                </div>

                {domain.project_name && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">プロジェクト</span>
                    <span className="text-sm truncate max-w-[150px]">{domain.project_name}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">自動更新</span>
                  {domain.auto_renew ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                {domain.dns_provider && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">DNS</span>
                    <span className="text-sm">{domain.dns_provider}</span>
                  </div>
                )}

                {domain.ssl_expire_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SSL期限</span>
                    <span className="text-sm">{domain.ssl_expire_date}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredDomains.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">ドメインが見つかりません</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}