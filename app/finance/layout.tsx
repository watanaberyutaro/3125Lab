import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-transparent">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  )
}