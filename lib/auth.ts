import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import AppRoutes from '@/helpers/AppRoutes'
import { getJwtSecret } from '@/lib/env'
import { prisma } from '@/lib/prisma'

export async function requireAuth() {
  const token = (await cookies()).get('auth-token')?.value
  if (!token) {
    redirect(AppRoutes.pages.login)
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecret()),
      { algorithms: ['HS256'] },
    ))
  } catch {
    redirect(AppRoutes.pages.login)
  }

  if (
    typeof payload.id !== 'number' ||
    typeof payload.authVersion !== 'number'
  ) {
    redirect(AppRoutes.pages.login)
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { authVersion: true },
  })

  if (!user || user.authVersion !== payload.authVersion) {
    redirect(AppRoutes.pages.login)
  }
}