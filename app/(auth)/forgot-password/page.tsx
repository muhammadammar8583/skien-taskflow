'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { useAuthApis } from '@/hooks/useAuthApis'
import { AuthButton, AuthCard, AuthEmailInput, AuthHeader, AuthLayout, AuthLink, AuthMessage } from '@/components/auth/auth-layout'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { handleForgotPasswordRequest, clearAuthError, loading, error } = useAuthApis()
  const [validationError, setValidationError] = useState('')
  const isLoading = loading

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      setValidationError(AppTexts.validation.forgotPassword)
      form.querySelector<HTMLElement>(':invalid')?.focus()
      return
    }

    setValidationError('')
    clearAuthError()
    const formData = new FormData(form)
    handleForgotPasswordRequest({
      email: String(formData.get(AppConstants.authFields.email) ?? '').trim(),
    }, () => router.push(AppRoutes.pages.verifyOtp))
  }

  return (
    <AuthLayout pageName={AppTexts.pageNames.forgotPassword}>
      <AuthCard>
        <AuthHeader title={AppTexts.auth.forgotPassword.title} description={AppTexts.auth.forgotPassword.description} />
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
          onChange={() => {
            setValidationError('')
            clearAuthError()
          }}
          noValidate
          aria-busy={isLoading}
        >
          <AuthEmailInput />
          <AuthButton disabled={isLoading}>
            {isLoading
              ? <><LoaderCircle className="size-4 animate-spin" />{AppTexts.auth.forgotPassword.loading}</>
              : <>{AppTexts.auth.forgotPassword.button}<ArrowRight className="size-4" /></>}
          </AuthButton>
          {validationError && <AuthMessage variant={AppConstants.authMessageVariants.error}>{validationError}</AuthMessage>}
          {error && <AuthMessage variant={AppConstants.authMessageVariants.error}>{error}</AuthMessage>}
        </form>
        <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
          {AppTexts.auth.forgotPassword.footerPrompt} <AuthLink href={AppRoutes.pages.login}>{AppTexts.actions.signIn}</AuthLink>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}