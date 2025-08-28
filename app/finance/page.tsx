'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getProjects, type Project } from '@/lib/supabase/projects'
import { 
  TrendingUp, 
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function FinancePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('すべて')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // 財務サマリーの計算
  const calculateSummary = () => {
    let totalRevenue = 0
    let totalCost = 0
    let totalDevelopmentFee = 0
    let activeProjectsCount = 0

    projects.forEach(project => {
      if (project.status !== 'archived' && project.status !== 'completed') {
        activeProjectsCount++
        totalRevenue += project.monthly_revenue || 0
        totalCost += project.monthly_cost || 0
      }
      totalDevelopmentFee += project.development_fee || 0
    })

    const monthlyProfit = totalRevenue - totalCost
    const annualProfit = monthlyProfit * 12

    return {
      totalRevenue,
      totalCost,
      monthlyProfit,
      annualProfit,
      totalDevelopmentFee,
      activeProjectsCount
    }
  }

  const summary = calculateSummary()

  // フィルタリング
  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'すべて') return true
    if (filterStatus === '黒字') return ((project.monthly_revenue || 0) - (project.monthly_cost || 0)) > 0
    if (filterStatus === '赤字') return ((project.monthly_revenue || 0) - (project.monthly_cost || 0)) < 0
    if (filterStatus === 'アクティブ') return project.status !== 'archived' && project.status !== 'completed'
    return true
  })

  // CSVエクスポート
  const exportToCSV = () => {
    const headers = ['プロジェクト名', 'クライアント', 'ステータス', '制作費用', '月額収入', '月額支出', '月額利益', '年間利益予測']
    const rows = filteredProjects.map(project => [
      project.name,
      project.client_name || '',
      project.status,
      project.development_fee || 0,
      project.monthly_revenue || 0,
      project.monthly_cost || 0,
      (project.monthly_revenue || 0) - (project.monthly_cost || 0),
      ((project.monthly_revenue || 0) - (project.monthly_cost || 0)) * 12
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `財務レポート_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">財務管理</h1>
          <p className="text-gray-600 mt-1">プロジェクトの収支状況と財務分析</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          CSVエクスポート
        </Button>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総月額収入</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{summary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">{summary.activeProjectsCount}件のアクティブプロジェクト</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総月額支出</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{summary.totalCost.toLocaleString()}</div>
            <p className="text-xs text-gray-600">サーバー・維持費</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月額利益</CardTitle>
            <Wallet className="h-4 w-4 text-gray-800" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.monthlyProfit >= 0 ? 'text-black' : 'text-gray-700'}`}>
              ¥{summary.monthlyProfit.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              利益率: {summary.totalRevenue > 0 ? Math.round((summary.monthlyProfit / summary.totalRevenue) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年間利益予測</CardTitle>
            <PiggyBank className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.annualProfit >= 0 ? 'text-black' : 'text-gray-700'}`}>
              ¥{summary.annualProfit.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">12ヶ月分の予測</p>
          </CardContent>
        </Card>
      </div>

      {/* 警告表示 */}
      {filteredProjects.some(p => ((p.monthly_revenue || 0) - (p.monthly_cost || 0)) < 0) && (
        <Card className="border-gray-400 bg-gray-100">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              赤字プロジェクトがあります
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredProjects
                .filter(p => ((p.monthly_revenue || 0) - (p.monthly_cost || 0)) < 0)
                .map(project => (
                  <div key={project.id} className="flex justify-between items-center">
                    <Link href={`/projects/${project.id}`}>
                      <span className="text-sm font-medium hover:underline">{project.name}</span>
                    </Link>
                    <span className="text-sm text-gray-800 font-bold">
                      ¥{((project.monthly_revenue || 0) - (project.monthly_cost || 0)).toLocaleString()}/月
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* フィルター */}
      <div className="flex gap-2">
        {['すべて', 'アクティブ', '黒字', '赤字'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 text-sm capitalize transition-colors ${
              filterStatus === status 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-black'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* プロジェクト別収支表 */}
      <Card>
        <CardHeader>
          <CardTitle>プロジェクト別収支</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-2 font-medium">プロジェクト</th>
                  <th className="text-left p-2 font-medium">クライアント</th>
                  <th className="text-right p-2 font-medium">制作費</th>
                  <th className="text-right p-2 font-medium">月額収入</th>
                  <th className="text-right p-2 font-medium">月額支出</th>
                  <th className="text-right p-2 font-medium">月額利益</th>
                  <th className="text-right p-2 font-medium">年間利益</th>
                  <th className="text-center p-2 font-medium">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      プロジェクトがありません
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map(project => {
                    const monthlyProfit = (project.monthly_revenue || 0) - (project.monthly_cost || 0)
                    const annualProfit = monthlyProfit * 12
                    
                    return (
                      <tr key={project.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <Link href={`/projects/${project.id}`}>
                            <span className="font-medium hover:underline">{project.name}</span>
                          </Link>
                        </td>
                        <td className="p-2 text-gray-600">{project.client_name || '-'}</td>
                        <td className="p-2 text-right">
                          {project.development_fee ? `¥${project.development_fee.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2 text-right">
                          {project.monthly_revenue ? `¥${project.monthly_revenue.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2 text-right">
                          {project.monthly_cost ? `¥${project.monthly_cost.toLocaleString()}` : '-'}
                        </td>
                        <td className={`p-2 text-right font-bold ${monthlyProfit >= 0 ? 'text-black' : 'text-gray-600'}`}>
                          {monthlyProfit !== 0 ? (
                            <span className="flex items-center justify-end gap-1">
                              {monthlyProfit > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                              ¥{Math.abs(monthlyProfit).toLocaleString()}
                            </span>
                          ) : '-'}
                        </td>
                        <td className={`p-2 text-right font-bold ${annualProfit >= 0 ? 'text-black' : 'text-gray-600'}`}>
                          {annualProfit !== 0 ? `¥${annualProfit.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`text-xs px-2 py-1 rounded border ${
                            project.status === 'production' ? 'bg-gray-900 text-white' :
                            project.status === 'development' ? 'bg-gray-700 text-white' :
                            project.status === 'maintenance' ? 'bg-gray-500 text-white' :
                            project.status === 'archived' ? 'bg-gray-200 text-gray-600' :
                            'bg-gray-300 text-gray-800 border-gray-400'
                          }`}>
                            {project.status === 'production' ? '本番' :
                             project.status === 'development' ? '開発中' :
                             project.status === 'maintenance' ? '保守' :
                             project.status === 'planning' ? '企画' :
                             project.status === 'completed' ? '完了' :
                             project.status === 'archived' ? 'アーカイブ' :
                             project.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              {filteredProjects.length > 0 && (
                <tfoot className="border-t-2 font-bold">
                  <tr>
                    <td colSpan={2} className="p-2">合計</td>
                    <td className="p-2 text-right">
                      ¥{filteredProjects.reduce((sum, p) => sum + (p.development_fee || 0), 0).toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      ¥{filteredProjects.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0).toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      ¥{filteredProjects.reduce((sum, p) => sum + (p.monthly_cost || 0), 0).toLocaleString()}
                    </td>
                    <td className={`p-2 text-right ${summary.monthlyProfit >= 0 ? 'text-black' : 'text-gray-600'}`}>
                      ¥{filteredProjects.reduce((sum, p) => sum + ((p.monthly_revenue || 0) - (p.monthly_cost || 0)), 0).toLocaleString()}
                    </td>
                    <td className={`p-2 text-right ${summary.annualProfit >= 0 ? 'text-black' : 'text-gray-600'}`}>
                      ¥{(filteredProjects.reduce((sum, p) => sum + ((p.monthly_revenue || 0) - (p.monthly_cost || 0)), 0) * 12).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}