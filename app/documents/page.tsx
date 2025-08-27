'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Upload, 
  Search,
  FileText,
  Download,
  Eye,
  Trash2,
  FolderOpen
} from 'lucide-react'

const documents = [
  {
    id: '1',
    title: 'プロジェクト仕様書_ECプラットフォーム.pdf',
    project: 'ECプラットフォーム',
    type: '仕様書',
    size: '2.4MB',
    uploadedBy: '山田太郎',
    uploadedAt: '2025-08-20',
    version: 'v2.1'
  },
  {
    id: '2',
    title: '契約書_ABC株式会社.pdf',
    project: 'ECプラットフォーム',
    type: '契約書',
    size: '1.1MB',
    uploadedBy: '佐藤花子',
    uploadedAt: '2025-08-15',
    version: 'v1.0'
  },
  {
    id: '3',
    title: 'API仕様書_モバイルアプリ.md',
    project: 'モバイルアプリ',
    type: '技術文書',
    size: '156KB',
    uploadedBy: '田中一郎',
    uploadedAt: '2025-08-10',
    version: 'v3.2'
  },
  {
    id: '4',
    title: '見積書_ランディングページ.xlsx',
    project: 'ランディングページ',
    type: '見積書',
    size: '89KB',
    uploadedBy: '鈴木二郎',
    uploadedAt: '2025-08-05',
    version: 'v1.1'
  },
]

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('すべて')

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'すべて' || doc.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case '契約書': return 'bg-gray-100 text-gray-900'
      case '見積書': return 'bg-gray-50 text-black'
      case '仕様書': return 'bg-gray-100 text-gray-800'
      case '技術文書': return 'bg-gray-200 text-gray-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ドキュメント</h1>
          <p className="text-gray-600 mt-1">プロジェクト関連書類の管理</p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          アップロード
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="ドキュメントを検索..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['すべて', '契約書', '見積書', '仕様書', '技術文書'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-sm transition-colors ${
                filterType === type 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-black'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:border-gray-400 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 bg-gray-100 rounded">
                    <FileText className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{doc.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {doc.project}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(doc.type)}`}>
                        {doc.type}
                      </span>
                      <span>{doc.size}</span>
                      <span>v{doc.version}</span>
                      <span>{doc.uploadedBy}</span>
                      <span>{doc.uploadedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-900 hover:text-gray-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}