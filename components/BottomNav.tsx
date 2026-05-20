'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, BookOpen, Shield, User } from 'lucide-react'

interface BottomNavProps {
  isAdmin: boolean
}

const baseItems = [
  { href: '/main/seats', label: '자리 배치도', Icon: LayoutGrid },
  { href: '/main/expression', label: '오늘의 표현', Icon: BookOpen },
]
const adminItem = { href: '/main/admin', label: '관리자', Icon: Shield }
const mypageItem = { href: '/main/mypage', label: '마이페이지', Icon: User }

export default function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname()
  const navItems = isAdmin
    ? [...baseItems, adminItem, mypageItem]
    : [...baseItems, mypageItem]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <div className="flex">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
                aria-hidden="true"
              />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
