import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // redirect response를 먼저 생성하고 쿠키를 직접 이 객체에 설정해야 함.
    // cookieStore(next/headers)를 쓰면 redirect response에 쿠키가 포함되지 않아
    // 브라우저가 세션 쿠키를 받지 못하고 인증 루프가 발생한다.
    const response = NextResponse.redirect(`${origin}/main`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            cookiesToSet.forEach(({ name, value, options }) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              response.cookies.set(name, value, options as any)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // /main/layout.tsx가 is_onboarded를 확인하여 /onboarding으로 분기함
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
