'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTasks } from '@/lib/supabase/tasks'
import { getProjects } from '@/lib/supabase/projects'
import type { TaskWithProject } from '@/lib/supabase/tasks'
import type { Project } from '@/lib/supabase/projects'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'task' | 'project_start' | 'project_end'
  status?: string
  priority?: string
  url: string
}

const eventTypeConfig = {
  task: { icon: CheckCircle, color: 'bg-gray-50', label: 'タスク' },
  project_start: { icon: FolderOpen, color: 'bg-white', label: 'プロジェクト開始' },
  project_end: { icon: FolderOpen, color: 'bg-gray-900', label: 'プロジェクト終了' },
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const [tasksData, projectsData] = await Promise.all([
        getTasks(),
        getProjects()
      ])

      const calendarEvents: CalendarEvent[] = []

      // タスクのイベントを追加
      tasksData.forEach((task: TaskWithProject) => {
        if (task.due_date) {
          calendarEvents.push({
            id: `task-${task.id}`,
            title: task.title,
            date: task.due_date,
            type: 'task',
            status: task.status,
            priority: task.priority,
            url: `/tasks/${task.id}`
          })
        }
      })

      // プロジェクトのイベントを追加
      projectsData.forEach((project: Project) => {
        if (project.start_date) {
          calendarEvents.push({
            id: `project-start-${project.id}`,
            title: `${project.name} (開始)`,
            date: project.start_date,
            type: 'project_start',
            status: project.status,
            url: `/projects/${project.id}`
          })
        }
        if (project.end_date) {
          calendarEvents.push({
            id: `project-end-${project.id}`,
            title: `${project.name} (終了)`,
            date: project.end_date,
            type: 'project_end',
            status: project.status,
            url: `/projects/${project.id}`
          })
        }
      })

      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
    } finally {
      setLoading(false)
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())
  
  const days = []
  const current = new Date(startDate)
  
  while (current <= lastDayOfMonth || days.length < 42) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
    if (days.length >= 42 && current.getMonth() !== month) break
  }

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDate = (date: Date) => {
    // ローカルタイムゾーンでの日付文字列を作成
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    return events.filter(event => event.date.startsWith(dateString))
  }

  const getSelectedDateEvents = () => {
    if (!selectedDate) return []
    return events.filter(event => event.date.startsWith(selectedDate))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">カレンダーを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">カレンダー</h1>
        <p className="text-gray-600 mt-1">タスクとプロジェクトのスケジュール管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {year}年 {monthNames[month]}
                </CardTitle>
                <div className="flex space-x-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day)
                  // ローカルタイムゾーンでの日付文字列を作成
                  const year = day.getFullYear()
                  const month = String(day.getMonth() + 1).padStart(2, '0')
                  const dayNum = String(day.getDate()).padStart(2, '0')
                  const dateString = `${year}-${month}-${dayNum}`
                  const isSelected = selectedDate === dateString
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-1 border rounded cursor-pointer transition-colors
                        ${isCurrentMonth(day) ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                        ${isToday(day) ? 'bg-gray-300 border-black' : 'border-black'}
                        ${isSelected && !isToday(day) ? 'bg-gray-100 border-black' : ''}
                        ${!isToday(day) ? 'hover:bg-gray-50' : 'hover:bg-gray-400'}
                      `}
                      onClick={() => setSelectedDate(dateString)}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${isToday(day) ? 'text-black' : ''}
                      `}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => {
                          const config = eventTypeConfig[event.type]
                          const getColor = () => {
                            if (event.type === 'task') {
                              if (event.status === 'completed') return 'bg-gray-200 text-gray-600'
                              switch (event.priority) {
                                case 'urgent': return 'bg-gray-900 text-white'
                                case 'high': return 'bg-gray-700 text-white'
                                case 'medium': return 'bg-gray-500 text-white'
                                case 'low': return 'bg-gray-300 text-gray-800'
                                default: return 'bg-gray-400 text-white'
                              }
                            }
                            if (event.type === 'project_start') return 'bg-white text-black border border-black'
                            if (event.type === 'project_end') return 'bg-gray-900 text-white'
                            return config.color + ' text-black'
                          }
                          return (
                            <Link key={event.id} href={event.url}>
                              <div
                                className={`
                                  text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80
                                  ${getColor()}
                                `}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            </Link>
                          )
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{dayEvents.length - 2} 件
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="mr-2 h-4 w-4" />
                今日の予定
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    {new Date(selectedDate).toLocaleDateString('ja-JP', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                  {getSelectedDateEvents().length > 0 ? (
                    getSelectedDateEvents().map((event) => {
                      const config = eventTypeConfig[event.type]
                      const Icon = config.icon
                      const getEventStyle = () => {
                        if (event.type === 'task') {
                          if (event.status === 'completed') return 'border-gray-300 bg-gray-100 text-gray-600'
                          switch (event.priority) {
                            case 'urgent': return 'border-gray-900 bg-gray-100 text-gray-900'
                            case 'high': return 'border-gray-700 bg-gray-100 text-gray-700'
                            case 'medium': return 'border-gray-500 bg-gray-50 text-gray-700'
                            case 'low': return 'border-gray-300 bg-white text-gray-600'
                            default: return 'border-gray-400 bg-gray-50 text-gray-700'
                          }
                        }
                        if (event.type === 'project_start') return 'border-black bg-white text-black'
                        if (event.type === 'project_end') return 'border-gray-900 bg-gray-900 text-white'
                        return 'border-gray-300 bg-gray-100 text-gray-800'
                      }
                      
                      return (
                        <Link key={event.id} href={event.url}>
                          <div
                            className={`p-3 border rounded-lg cursor-pointer hover:opacity-80 ${getEventStyle()}`}
                          >
                            <div className="flex items-start space-x-2">
                              <Icon className={`h-4 w-4 mt-0.5`} />
                              <div className="flex-1">
                                <p className={`font-medium text-sm`}>
                                  {event.title}
                                </p>
                                <p className="text-xs mt-1 opacity-80">
                                  {config.label}
                                  {event.priority && ` • ${event.priority === 'urgent' ? '緊急' : event.priority === 'high' ? '高' : event.priority === 'medium' ? '中' : '低'}優先度`}
                                  {event.status && ` • ${event.status === 'completed' ? '完了' : event.status === 'in_progress' ? '進行中' : event.status === 'todo' ? '未着手' : event.status}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-500">この日には予定がありません</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">日付を選択してください</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="mr-2 h-4 w-4" />
                近日中の重要な期限
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events
                  .filter(event => {
                    if (event.type === 'task' && (event.priority === 'urgent' || event.priority === 'high')) return true
                    if (event.type !== 'task') return true
                    return false
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .filter(event => {
                    const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return daysUntil >= -7 && daysUntil <= 30
                  })
                  .slice(0, 5)
                  .map((event) => {
                    const config = eventTypeConfig[event.type]
                    const Icon = config.icon
                    const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <Link key={event.id} href={event.url}>
                        <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <Icon className={`h-4 w-4 text-gray-600`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(event.date).toLocaleDateString('ja-JP')} • 
                              {daysUntil > 0 ? `${daysUntil}日後` : daysUntil === 0 ? '今日' : `${Math.abs(daysUntil)}日前`}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}