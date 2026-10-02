import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import AppTexts from '@/constants/AppTexts'

export const metadata: Metadata = { title: AppTexts.pageNames.resetPassword }

export default function ResetPasswordLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children
}