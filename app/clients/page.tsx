'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { ClientForm } from '@/components/forms/client-form'
import { getClients, deleteClient as deleteClientApi } from '@/lib/supabase/clients'
import type { Client } from '@/lib/supabase/clients'
import { 
  Plus, 
  Search,
  Mail,
  Phone,
  Building,
  Edit,
  Trash2,
  FileText
} from 'lucide-react'


export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined)
  
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このクライアントを削除してもよろしいですか？')) return
    
    try {
      await deleteClientApi(id)
      await fetchClients()
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingClient(undefined)
    fetchClients()
  }

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase()
    return (client.name?.toLowerCase().includes(searchLower) || '') ||
           (client.company_name?.toLowerCase().includes(searchLower) || '') ||
           (client.email?.toLowerCase().includes(searchLower) || '')
  })


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">クライアント</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">クライアント情報と関係を管理</p>
        </div>
        <Button className="flex items-center justify-center gap-2 w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          <span>新規クライアント</span>
        </Button>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="クライアントを検索..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:border-gray-400 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Building className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{client.company_name || client.name}</span>
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600">{client.contact_person || client.name}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <Mail className="h-3.5 sm:h-4 w-3.5 sm:w-4 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{client.email || 'メールなし'}</span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <Phone className="h-3.5 sm:h-4 w-3.5 sm:w-4 mt-0.5 flex-shrink-0" />
                  <span>{client.phone || '電話番号なし'}</span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <Building className="h-3.5 sm:h-4 w-3.5 sm:w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{client.address || '住所なし'}</span>
                </div>
              </div>

              {client.notes && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">備考</p>
                  <p className="text-xs sm:text-sm line-clamp-2">{client.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200">
                <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1 text-xs flex-1 sm:flex-initial px-2 py-1">
                  <FileText className="h-3 w-3" />
                  <span className="hidden sm:inline">契約書</span>
                  <span className="sm:hidden">書類</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1 text-xs flex-1 sm:flex-initial px-2 py-1" onClick={() => handleEdit(client)}>
                  <Edit className="h-3 w-3" />
                  <span className="hidden sm:inline">編集</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1 text-xs text-gray-900 hover:text-gray-700 flex-1 sm:flex-initial px-2 py-1" onClick={() => client.id && handleDelete(client.id)}>
                  <Trash2 className="h-3 w-3" />
                  <span className="hidden sm:inline">削除</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={handleCloseModal}
        title={editingClient ? 'クライアント編集' : '新規クライアント'}
      >
        <ClientForm
          client={editingClient}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  )
}