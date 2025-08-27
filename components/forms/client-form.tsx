'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { createClient, updateClient } from '@/lib/supabase/clients'
import type { Client } from '@/lib/supabase/clients'

interface ClientFormProps {
  client?: Client
  onClose?: () => void
}

export function ClientForm({ client, onClose }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: client?.name || '',
    company_name: client?.company_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    website: client?.website || '',
    contact_person: client?.contact_person || '',
    notes: client?.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (client?.id) {
        await updateClient(client.id, formData)
      } else {
        await createClient(formData)
      }
      
      router.refresh()
      if (onClose) onClose()
    } catch (err) {
      console.error('Error saving client:', err)
      setError(err instanceof Error ? err.message : '保存中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">クライアント名 *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="山田 太郎"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">会社名</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="株式会社サンプル"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sample@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">電話番号</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="03-1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">担当者名</Label>
            <Input
              id="contact_person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="佐藤 花子"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">ウェブサイト</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">住所</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="東京都渋谷区..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">備考</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="クライアントに関するメモや注意事項"
          />
        </div>

        {error && (
          <div className="p-3 bg-gray-50 text-gray-900 text-sm rounded border border-black">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : (client?.id ? '更新' : '登録')}
          </Button>
        </div>
      </form>
    </Card>
  )
}