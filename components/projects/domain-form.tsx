'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

const domainSchema = z.object({
  domain_name: z.string().min(1, 'ドメイン名は必須です'),
  registrar: z.string().optional(),
  registrar_url: z.string().url().optional().or(z.literal('')),
  registrar_username: z.string().optional(),
  registrar_password: z.string().optional(),
  dns_provider: z.string().optional(),
  dns_settings: z.string().optional(),
  expiry_date: z.string().min(1, '有効期限は必須です'),
  auto_renew: z.boolean().default(false),
  ssl_provider: z.string().optional(),
  ssl_expiry_date: z.string().optional(),
  whois_privacy: z.boolean().default(true),
  yearly_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type DomainFormData = z.infer<typeof domainSchema>

interface DomainFormProps {
  projectId: string
  domain?: Partial<DomainFormData> | null
  onClose: () => void
  onSave: () => void
}

export function DomainForm({ projectId, domain, onClose, onSave }: DomainFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DomainFormData>({
    // @ts-expect-error - Type mismatch with optional fields
    resolver: zodResolver(domainSchema),
    defaultValues: {
      auto_renew: false,
      whois_privacy: true,
      ...domain,
    } as DomainFormData,
  })

  const onSubmit = async (data: DomainFormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        project_id: projectId,
        registrar_url: data.registrar_url || null,
      }

      if (domain && 'id' in domain) {
        const { error } = await supabase
          .from('project_domains')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update(payload as any)
          .eq('id', domain.id as string)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('project_domains')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(payload as any)

        if (error) throw error
      }

      onSave()
    } catch (error) {
      console.error('Error saving domain:', error)
      alert('ドメイン情報の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {domain ? 'ドメイン情報を編集' : 'ドメイン情報を追加'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Label htmlFor="domain_name">ドメイン名 *</Label>
            <Input
              id="domain_name"
              {...register('domain_name')}
              placeholder="例: example.com"
            />
            {errors.domain_name && (
              <p className="text-red-500 text-sm mt-1">{errors.domain_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrar">レジストラ</Label>
              <Input
                id="registrar"
                {...register('registrar')}
                placeholder="例: お名前.com"
              />
            </div>

            <div>
              <Label htmlFor="yearly_cost">年額費用</Label>
              <Input
                id="yearly_cost"
                type="number"
                {...register('yearly_cost', { valueAsNumber: true })}
                placeholder="例: 1500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="registrar_url">管理画面URL</Label>
            <Input
              id="registrar_url"
              {...register('registrar_url')}
              placeholder="https://example.com/admin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrar_username">管理画面ユーザー名</Label>
              <Input
                id="registrar_username"
                {...register('registrar_username')}
                placeholder="ユーザー名"
              />
            </div>

            <div>
              <Label htmlFor="registrar_password">管理画面パスワード</Label>
              <Input
                id="registrar_password"
                type="password"
                {...register('registrar_password')}
                placeholder="パスワード"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dns_provider">DNSプロバイダー</Label>
              <Input
                id="dns_provider"
                {...register('dns_provider')}
                placeholder="例: Cloudflare"
              />
            </div>

            <div>
              <Label htmlFor="ssl_provider">SSL証明書プロバイダー</Label>
              <Input
                id="ssl_provider"
                {...register('ssl_provider')}
                placeholder="例: Let's Encrypt"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dns_settings">DNS設定メモ</Label>
            <Textarea
              id="dns_settings"
              {...register('dns_settings')}
              placeholder="DNS設定の詳細（A、CNAME、MXレコードなど）"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry_date">ドメイン有効期限 *</Label>
              <Input
                id="expiry_date"
                type="date"
                {...register('expiry_date')}
              />
              {errors.expiry_date && (
                <p className="text-red-500 text-sm mt-1">{errors.expiry_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ssl_expiry_date">SSL証明書有効期限</Label>
              <Input
                id="ssl_expiry_date"
                type="date"
                {...register('ssl_expiry_date')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto_renew"
                {...register('auto_renew')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="auto_renew" className="font-normal cursor-pointer">
                自動更新
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="whois_privacy"
                {...register('whois_privacy')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="whois_privacy" className="font-normal cursor-pointer">
                WHOIS情報保護
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">メモ</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="追加情報やメモ"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}