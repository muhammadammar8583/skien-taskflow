import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import AppTexts from '@/constants/AppTexts'

export const metadata: Metadata = { title: AppTexts.metadata.auth }

export default function AuthRoutesLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children
}