import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import AppTexts from '@/constants/AppTexts'

export const metadata: Metadata = { title: AppTexts.pageNames.forgotPassword }

export default function ForgotPasswordLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children
}