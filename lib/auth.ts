import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import AppRoutes from '@/helpers/AppRoutes'

export async function requireAuth() {
  const token = (await cookies()).get('auth-token')?.value
  const secret = process.env.JWT_SECRET

  if (!token || !secret) {
    redirect(AppRoutes.pages.login)
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret))
  } catch {
    redirect(AppRoutes.pages.login)
  }
}