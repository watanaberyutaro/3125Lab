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

const serverSchema = z.object({
  server_name: z.string().min(1, 'サーバー名は必須です'),
  server_type: z.enum(['vps', 'shared', 'dedicated', 'cloud', 'other']),
  provider: z.string().optional(),
  hostname: z.string().optional(),
  ip_address: z.string().optional(),
  ssh_port: z.number().min(1).max(65535).default(22),
  ssh_username: z.string().optional(),
  ssh_password: z.string().optional(),
  ssh_key_info: z.string().optional(),
  control_panel_url: z.string().url().optional().or(z.literal('')),
  control_panel_username: z.string().optional(),
  control_panel_password: z.string().optional(),
  monthly_cost: z.number().min(0).optional(),
  renewal_date: z.string().optional(),
  notes: z.string().optional(),
})

type ServerFormData = z.infer<typeof serverSchema>

interface ServerFormProps {
  projectId: string
  server?: Partial<ServerFormData> | null
  onClose: () => void
  onSave: () => void
}

export function ServerForm({ projectId, server, onClose, onSave }: ServerFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServerFormData>({
    resolver: zodResolver(serverSchema),
    defaultValues: {
      server_type: 'vps',
      ssh_port: 22,
      ...server,
    } as ServerFormData,
  })

  const onSubmit = async (data: ServerFormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        project_id: projectId,
        control_panel_url: data.control_panel_url || null,
      }

      if (server && 'id' in server) {
        const { error } = await supabase
          .from('project_servers')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update(payload as any)
          .eq('id', server.id as string)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('project_servers')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(payload as any)

        if (error) throw error
      }

      onSave()
    } catch (error) {
      console.error('Error saving server:', error)
      alert('サーバー情報の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {server ? 'サーバー情報を編集' : 'サーバー情報を追加'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="server_name">サーバー名 *</Label>
              <Input
                id="server_name"
                {...register('server_name')}
                placeholder="例: 本番サーバー"
              />
              {errors.server_name && (
                <p className="text-red-500 text-sm mt-1">{errors.server_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="server_type">サーバータイプ *</Label>
              <select
                id="server_type"
                {...register('server_type')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="vps">VPS</option>
                <option value="shared">共有サーバー</option>
                <option value="dedicated">専用サーバー</option>
                <option value="cloud">クラウド</option>
                <option value="other">その他</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider">プロバイダー</Label>
              <Input
                id="provider"
                {...register('provider')}
                placeholder="例: さくらインターネット"
              />
            </div>

            <div>
              <Label htmlFor="monthly_cost">月額費用</Label>
              <Input
                id="monthly_cost"
                type="number"
                {...register('monthly_cost', { valueAsNumber: true })}
                placeholder="例: 5000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hostname">ホスト名</Label>
              <Input
                id="hostname"
                {...register('hostname')}
                placeholder="例: server.example.com"
              />
            </div>

            <div>
              <Label htmlFor="ip_address">IPアドレス</Label>
              <Input
                id="ip_address"
                {...register('ip_address')}
                placeholder="例: 192.168.1.1"
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">SSH接続情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ssh_username">SSHユーザー名</Label>
                <Input
                  id="ssh_username"
                  {...register('ssh_username')}
                  placeholder="例: root"
                />
              </div>

              <div>
                <Label htmlFor="ssh_port">SSHポート</Label>
                <Input
                  id="ssh_port"
                  type="number"
                  {...register('ssh_port', { valueAsNumber: true })}
                  placeholder="22"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ssh_password">SSHパスワード</Label>
              <Input
                id="ssh_password"
                type="password"
                {...register('ssh_password')}
                placeholder="パスワード"
              />
            </div>

            <div>
              <Label htmlFor="ssh_key_info">SSH鍵情報</Label>
              <Textarea
                id="ssh_key_info"
                {...register('ssh_key_info')}
                placeholder="SSH鍵の保存場所や設定情報"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">管理画面情報</h3>
            <div>
              <Label htmlFor="control_panel_url">管理画面URL</Label>
              <Input
                id="control_panel_url"
                {...register('control_panel_url')}
                placeholder="https://example.com/admin"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="control_panel_username">管理画面ユーザー名</Label>
                <Input
                  id="control_panel_username"
                  {...register('control_panel_username')}
                  placeholder="admin"
                />
              </div>

              <div>
                <Label htmlFor="control_panel_password">管理画面パスワード</Label>
                <Input
                  id="control_panel_password"
                  type="password"
                  {...register('control_panel_password')}
                  placeholder="パスワード"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="renewal_date">更新日</Label>
            <Input
              id="renewal_date"
              type="date"
              {...register('renewal_date')}
            />
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