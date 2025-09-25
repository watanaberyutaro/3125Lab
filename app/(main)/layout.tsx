import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-transparent">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-transparent pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}