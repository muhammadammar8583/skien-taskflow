'use client'

import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, LoaderCircle, MailCheck } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { AuthActionLink, AuthButton, AuthCard, AuthEmailInput, AuthHeader, AuthLayout, AuthLink, AuthMessage, AuthStateIcon } from '@/components/auth/auth-layout'

export default function ForgotPasswordPage() {
  const [validationError, setValidationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      setValidationError(AppTexts.validation.forgotPassword)
      form.querySelector<HTMLElement>(':invalid')?.focus()
      return
    }

    setValidationError('')
    setIsLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title={submitted ? AppTexts.auth.forgotPassword.successTitle : AppTexts.auth.forgotPassword.title}
          description={submitted ? AppTexts.auth.forgotPassword.successDescription : AppTexts.auth.forgotPassword.description}
        />
        {submitted ? (
          <div className="space-y-5">
            <AuthStateIcon variant={AppConstants.authStateVariants.success}>
              <MailCheck className="size-5" aria-hidden="true" />
            </AuthStateIcon>
            <AuthActionLink href={AppRoutes.pages.login}>
              <ArrowLeft className="size-4" />{AppTexts.auth.forgotPassword.successAction}
            </AuthActionLink>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
            onChange={() => setValidationError('')}
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
          </form>
        )}
        {!submitted && (
          <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
            {AppTexts.auth.forgotPassword.footerPrompt} <AuthLink href={AppRoutes.pages.login}>{AppTexts.actions.signIn}</AuthLink>
          </p>
        )}
      </AuthCard>
    </AuthLayout>
  )
}