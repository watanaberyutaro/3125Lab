import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  try {
    // 現在日時
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    // 30日以内に期限が切れるドメインを取得
    const { data: expiringDomains, error: domainError } = await supabase
      .from('project_domains')
      .select('*')
      .or(`expiry_date.lte.${thirtyDaysFromNow.toISOString()},ssl_expiry_date.lte.${thirtyDaysFromNow.toISOString()}`)
      .gte('expiry_date', now.toISOString())

    if (domainError) throw domainError

    // 30日以内に更新期限が来るサーバーを取得
    const { data: expiringServers, error: serverError } = await supabase
      .from('project_servers')
      .select('*')
      .lte('renewal_date', thirtyDaysFromNow.toISOString())
      .gte('renewal_date', now.toISOString())

    if (serverError) throw serverError

    // 通知データを整形
    interface NotificationItem {
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

    const notifications: NotificationItem[] = []

    // ドメイン期限通知
    if (expiringDomains && expiringDomains.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiringDomains.forEach((domain: any) => {
        const daysUntilExpiry = Math.ceil(
          (new Date(domain.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        let urgency = 'info'
        if (daysUntilExpiry <= 7) urgency = 'critical'
        else if (daysUntilExpiry <= 14) urgency = 'warning'

        notifications.push({
          type: 'domain_expiry',
          urgency,
          title: `ドメイン更新期限: ${domain.domain_name}`,
          message: `あと${daysUntilExpiry}日で期限切れ`,
          date: domain.expiry_date,
          auto_renew: domain.auto_renew,
          id: domain.id
        })

        // SSL証明書期限もチェック
        if (domain.ssl_expiry_date) {
          const sslDaysUntilExpiry = Math.ceil(
            (new Date(domain.ssl_expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )

          if (sslDaysUntilExpiry <= 30) {
            let sslUrgency = 'info'
            if (sslDaysUntilExpiry <= 7) sslUrgency = 'critical'
            else if (sslDaysUntilExpiry <= 14) sslUrgency = 'warning'

            notifications.push({
              type: 'ssl_expiry',
              urgency: sslUrgency,
              title: `SSL証明書更新期限: ${domain.domain_name}`,
              message: `あと${sslDaysUntilExpiry}日で期限切れ`,
              date: domain.ssl_expiry_date,
              id: `ssl-${domain.id}`
            })
          }
        }
      })
    }

    // サーバー更新通知
    if (expiringServers && expiringServers.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiringServers.forEach((server: any) => {
        const daysUntilRenewal = Math.ceil(
          (new Date(server.renewal_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        let urgency = 'info'
        if (daysUntilRenewal <= 7) urgency = 'critical'
        else if (daysUntilRenewal <= 14) urgency = 'warning'

        notifications.push({
          type: 'server_renewal',
          urgency,
          title: `サーバー更新期限: ${server.server_name}`,
          message: `あと${daysUntilRenewal}日で更新`,
          date: server.renewal_date,
          monthly_cost: server.monthly_cost,
          id: server.id
        })
      })
    }

    // 緊急度でソート
    const urgencyOrder = { critical: 0, warning: 1, info: 2 }
    notifications.sort((a, b) => {
      const urgencyDiff = urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder]
      if (urgencyDiff !== 0) return urgencyDiff

      // 同じ緊急度の場合は日付でソート
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    return NextResponse.json({
      notifications,
      summary: {
        total: notifications.length,
        critical: notifications.filter(n => n.urgency === 'critical').length,
        warning: notifications.filter(n => n.urgency === 'warning').length,
        info: notifications.filter(n => n.urgency === 'info').length
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}