'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, AlertTriangle, Info, Calendar, DollarSign } from 'lucide-react'

interface Notification {
  type: string
  urgency: string
  title: string
  message: string
  project?: string
  client?: string
  date: string
  auto_renew?: boolean
  monthly_cost?: number
  id: string
}

interface NotificationSummary {
  total: number
  critical: number
  warning: number
  info: number
}

export function InfrastructureNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [summary, setSummary] = useState<NotificationSummary>({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/infrastructure/notifications')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notifications')
      }

      setNotifications(data.notifications || [])
      setSummary(data.summary || {
        total: 0,
        critical: 0,
        warning: 0,
        info: 0
      })
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('通知の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'border-red-600 bg-red-50'
      case 'warning':
        return 'border-orange-600 bg-orange-50'
      default:
        return 'border-blue-600 bg-blue-50'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>インフラ更新通知</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-center py-4">読み込み中...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>インフラ更新通知</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-4">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>インフラ更新通知</span>
          {summary.total > 0 && (
            <div className="flex gap-2 text-sm">
              {summary.critical > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  緊急 {summary.critical}
                </span>
              )}
              {summary.warning > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                  警告 {summary.warning}
                </span>
              )}
              {summary.info > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  情報 {summary.info}
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 p-3 rounded-r-lg ${getUrgencyClass(notification.urgency)}`}
              >
                <div className="flex items-start gap-3">
                  {getUrgencyIcon(notification.urgency)}
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold">{notification.title}</div>
                    <div className="text-sm text-gray-600">{notification.message}</div>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                      {notification.project && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {notification.project}
                        </span>
                      )}
                      {notification.client && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {notification.client}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(notification.date)}
                      </span>
                      {notification.monthly_cost && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ¥{notification.monthly_cost.toLocaleString()}/月
                        </span>
                      )}
                      {notification.auto_renew && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          自動更新
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            <Info className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>30日以内に更新が必要な項目はありません</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}