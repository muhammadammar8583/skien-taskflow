'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { AuthButton, AuthCard, AuthDivider, AuthEmailInput, AuthHeader, AuthLayout, AuthLink, AuthMessage } from '@/components/auth/auth-layout'
import { FormInput } from '@/components/ui/form-input'
import { PasswordField } from '@/components/ui/password-field'

export default function LoginPage() {
  const [validationError, setValidationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      setValidationError(AppTexts.validation.login)
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
        <AuthHeader title={AppTexts.auth.login.title} description={AppTexts.auth.login.description} />
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
          onChange={() => {
            setValidationError('')
            setSubmitted(false)
          }}
          noValidate
          aria-busy={isLoading}
        >
          <AuthEmailInput />
          <PasswordField
            id={AppConstants.authFields.password}
            label={AppTexts.fields.password}
            placeholder={AppTexts.fields.passwordPlaceholder}
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between gap-3">
            <FormInput
              id={AppConstants.authFields.remember}
              type={AppConstants.inputTypes.checkbox}
              label={AppTexts.fields.rememberMe}
              wrapperClassName="min-h-8"
            />
            <AuthLink href={AppRoutes.pages.forgotPassword}>{AppTexts.actions.forgotPassword}</AuthLink>
          </div>
          <AuthButton disabled={isLoading}>
            {isLoading
              ? <><LoaderCircle className="size-4 animate-spin" />{AppTexts.auth.login.loading}</>
              : <>{AppTexts.auth.login.button}<ArrowRight className="size-4" /></>}
          </AuthButton>
          {validationError && <AuthMessage variant={AppConstants.authMessageVariants.error}>{validationError}</AuthMessage>}
          {submitted && <AuthMessage>{AppTexts.actions.previewNotice}</AuthMessage>}
        </form>
        <div className="mt-4"><AuthDivider /></div>
        <div className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
          <p>{AppTexts.actions.doNotHaveAccount} <AuthLink href={AppRoutes.pages.register}>{AppTexts.actions.createAccount}</AuthLink></p>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}