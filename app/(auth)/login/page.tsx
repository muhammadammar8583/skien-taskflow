'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { useAuthApis } from '@/hooks/useAuthApis'
import { AuthButton, AuthCard, AuthDivider, AuthEmailInput, AuthHeader, AuthLayout, AuthLink, AuthMessage } from '@/components/auth/auth-layout'
import { FormInput } from '@/components/ui/form-input'
import { PasswordField } from '@/components/ui/password-field'

export default function LoginPage() {
  const router = useRouter()
  const { handleLoginRequest, clearAuthError, loading, error } = useAuthApis()
  const [validationError, setValidationError] = useState('')
  const isLoading = loading

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      setValidationError(AppTexts.validation.login)
      form.querySelector<HTMLElement>(':invalid')?.focus()
      return
    }

    setValidationError('')
    const formData = new FormData(form)
    handleLoginRequest({
      email: String(formData.get(AppConstants.authFields.email) ?? '').trim(),
      password: String(formData.get(AppConstants.authFields.password) ?? ''),
    }, () => router.replace(AppRoutes.pages.dashboard))
  }

  return (
    <AuthLayout pageName={AppTexts.pageNames.login}>
      <AuthCard>
        <AuthHeader title={AppTexts.auth.login.title} description={AppTexts.auth.login.description} />
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
          <PasswordField
            id={AppConstants.authFields.password}
            label={AppTexts.fields.password}
            placeholder={AppTexts.fields.passwordPlaceholder}
            autoComplete="current-password"
          />
          {error && <AuthMessage variant={AppConstants.authMessageVariants.error}>{error}</AuthMessage>}
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
        </form>
        <div className="mt-4"><AuthDivider /></div>
        <div className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
          <p>{AppTexts.actions.doNotHaveAccount} <AuthLink href={AppRoutes.pages.register}>{AppTexts.actions.createAccount}</AuthLink></p>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}