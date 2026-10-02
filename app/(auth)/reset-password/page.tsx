'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check, CircleAlert, LoaderCircle } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { AuthActionLink, AuthButton, AuthCard, AuthHeader, AuthLayout, AuthLink, AuthMessage, AuthStateIcon } from '@/components/auth/auth-layout'
import { PasswordRequirements } from '@/components/auth/password-requirements'
import { PasswordField } from '@/components/ui/password-field'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFlow />
    </Suspense>
  )
}

function ResetPasswordFlow() {
  const searchParams = useSearchParams()
  const invalidToken = searchParams.get(AppConstants.resetLinkStateQueryKey) === AppConstants.resetLinkStates.expired
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      setValidationError(AppTexts.validation.resetPassword)
      form.querySelector<HTMLElement>(':invalid')?.focus()
      return
    }

    const formData = new FormData(form)
    const passwordValue = String(formData.get(AppConstants.authFields.password) ?? '')
    const confirmPassword = String(formData.get(AppConstants.authFields.confirmPassword) ?? '')
    if (passwordValue.length < 8) {
      setValidationError(AppTexts.validation.resetPasswordMinLength)
      form.querySelector<HTMLInputElement>(`[name="${AppConstants.authFields.password}"]`)?.focus()
      return
    }
    if (!/[A-Z]/.test(passwordValue) || !/[a-z]/.test(passwordValue) || !/\d/.test(passwordValue)) {
      setValidationError(AppTexts.validation.resetPasswordComplexity)
      form.querySelector<HTMLInputElement>(`[name="${AppConstants.authFields.password}"]`)?.focus()
      return
    }
    if (passwordValue !== confirmPassword) {
      setValidationError(AppTexts.validation.passwordsMismatch)
      form.querySelector<HTMLInputElement>(`[name="${AppConstants.authFields.confirmPassword}"]`)?.focus()
      return
    }

    setValidationError('')
    setIsLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <AuthLayout pageName={AppTexts.pageNames.resetPassword}>
      <AuthCard>
        <AuthHeader
          title={invalidToken
            ? AppTexts.auth.resetPassword.expiredTitle
            : submitted
              ? AppTexts.auth.resetPassword.successTitle
              : AppTexts.auth.resetPassword.title}
          description={invalidToken
            ? AppTexts.auth.resetPassword.expiredDescription
            : submitted
              ? AppTexts.auth.resetPassword.successDescription
              : AppTexts.auth.resetPassword.description}
        />
        {invalidToken ? (
          <div className="space-y-5">
            <AuthStateIcon variant={AppConstants.authStateVariants.warning}>
              <CircleAlert className="size-5" aria-hidden="true" />
            </AuthStateIcon>
            <AuthActionLink href={AppRoutes.pages.forgotPassword}>
              {AppTexts.auth.resetPassword.expiredAction}<ArrowRight className="size-4" />
            </AuthActionLink>
          </div>
        ) : submitted ? (
          <div className="space-y-5">
            <AuthStateIcon variant={AppConstants.authStateVariants.success}>
              <Check className="size-5" aria-hidden="true" />
            </AuthStateIcon>
            <AuthActionLink href={AppRoutes.pages.login}>
              {AppTexts.actions.signIn}<ArrowRight className="size-4" />
            </AuthActionLink>
          </div>
        ) : (
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
            <div className="space-y-2">
              <PasswordField
                id={AppConstants.authFields.password}
                label={AppTexts.fields.newPassword}
                placeholder={AppTexts.fields.newPasswordPlaceholder}
                value={password}
                onValueChange={setPassword}
              />
              {password.length > 0 && <PasswordRequirements password={password} />}
            </div>
            <PasswordField
              id={AppConstants.authFields.confirmPassword}
              label={AppTexts.fields.confirmPassword}
              placeholder={AppTexts.fields.confirmNewPasswordPlaceholder}
              showLabel={AppTexts.password.showConfirm}
              hideLabel={AppTexts.password.hideConfirm}
            />
            <AuthButton disabled={isLoading}>
              {isLoading
                ? <><LoaderCircle className="size-4 animate-spin" />{AppTexts.auth.resetPassword.loading}</>
                : <>{AppTexts.auth.resetPassword.button}<ArrowRight className="size-4" /></>}
            </AuthButton>
            {validationError && <AuthMessage variant={AppConstants.authMessageVariants.error}>{validationError}</AuthMessage>}
          </form>
        )}
        {!invalidToken && !submitted && (
          <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
            {AppTexts.auth.forgotPassword.footerPrompt} <AuthLink href={AppRoutes.pages.login}>{AppTexts.actions.signIn}</AuthLink>
          </p>
        )}
      </AuthCard>
    </AuthLayout>
  )
}