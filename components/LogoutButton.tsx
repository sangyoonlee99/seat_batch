'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function LogoutButton() {
  const { signOut } = useAuth()

  return (
    <Button variant="outline" onClick={signOut}>
      로그아웃
    </Button>
  )
}
