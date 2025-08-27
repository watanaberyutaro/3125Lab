'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  projectName: string
  loading?: boolean
}

export function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  projectName,
  loading = false
}: DeleteConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (inputValue === projectName) {
      onConfirm()
      setInputValue('')
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleClose = () => {
    setInputValue('')
    setError(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="プロジェクトの削除確認">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-gray-900 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-gray-900">
              このプロジェクトを削除しますか？
            </p>
            <p className="text-sm text-gray-600">
              この操作は取り消すことができません。プロジェクトに関連するすべてのデータが完全に削除されます。
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            削除するには、下記のプロジェクト名を正確に入力してください：
          </p>
          
          <div className="bg-white border-2 border-black rounded px-3 py-2">
            <p className="font-mono font-bold text-black">{projectName}</p>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setError(false)
              }}
              placeholder="プロジェクト名を入力"
              className={error ? 'border-gray-900' : ''}
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="text-sm text-gray-900">
                プロジェクト名が一致しません。正確に入力してください。
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={inputValue !== projectName || loading}
            className="bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? '削除中...' : 'プロジェクトを削除'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}