import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import AppTexts from '@/constants/AppTexts'

export const metadata: Metadata = { title: AppTexts.metadata.verifyOtp }

export default function VerifyOtpLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children
}
