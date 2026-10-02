import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import AppTexts from '@/constants/AppTexts'

export const metadata: Metadata = { title: AppTexts.pageNames.login }

export default function LoginLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children
}