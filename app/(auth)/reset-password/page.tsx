'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check, CircleAlert, LoaderCircle } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { AuthActionLink, AuthButton, AuthCard, AuthHeader, AuthLayout, AuthLink, AuthMessage, AuthStateIcon } from '@/components/auth/auth-layout'
import { PasswordRequirements } from '@/components/auth/password-requirements'
import { PasswordField } from '@/components/ui/password-field'
import { useAuthApis } from '@/hooks/useAuthApis'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFlow />
    </Suspense>
  )
}

function ResetPasswordFlow() {
  const searchParams = useSearchParams()
  const { handleResetPasswordRequest, clearAuthError, loading, error } = useAuthApis()
  const invalidToken = searchParams.get(AppConstants.resetLinkStateQueryKey) === AppConstants.resetLinkStates.expired
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [resetCredentials, setResetCredentials] = useState<{
    email: string
    resetToken: string
  } | null>(null)
  const [isSessionReady, setIsSessionReady] = useState(false)

  useEffect(() => {
    const email = window.sessionStorage.getItem(
      AppConstants.passwordResetSessionKeys.email,
    )
    const resetToken = window.sessionStorage.getItem(
      AppConstants.passwordResetSessionKeys.token,
    )

    if (email && resetToken) {
      setResetCredentials({ email, resetToken })
    }
    setIsSessionReady(true)
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    if (
      !/[A-Z]/.test(passwordValue) ||
      !/[a-z]/.test(passwordValue) ||
      !/\d/.test(passwordValue) ||
      !/[^A-Za-z0-9]/.test(passwordValue)
    ) {
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
    clearAuthError()
    if (!resetCredentials) {
      setValidationError('This reset session has expired. Request a new code.')
      return
    }

    handleResetPasswordRequest({
      email: resetCredentials.email,
      resetToken: resetCredentials.resetToken,
      newPassword: passwordValue,
      confirmPassword,
    }).then(() => {
      window.sessionStorage.removeItem(AppConstants.passwordResetSessionKeys.email)
      window.sessionStorage.removeItem(AppConstants.passwordResetSessionKeys.token)
      setResetCredentials(null)
      setSubmitted(true)
    }).catch(() => undefined)
  }

  const isLoading = loading
  const sessionExpired = isSessionReady && !resetCredentials && !submitted

  if (!isSessionReady && !invalidToken) {
    return (
      <AuthLayout pageName={AppTexts.pageNames.resetPassword}>
        <AuthCard>
          <AuthHeader
            title={AppTexts.auth.resetPassword.title}
            description={AppTexts.auth.resetPassword.description}
          />
          <div className="flex justify-center py-2">
            <LoaderCircle
              className="size-5 animate-spin text-violet-300"
              aria-label="Loading password reset session"
            />
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout pageName={AppTexts.pageNames.resetPassword}>
      <AuthCard>
        <AuthHeader
          title={invalidToken || sessionExpired
            ? AppTexts.auth.resetPassword.expiredTitle
            : submitted
              ? AppTexts.auth.resetPassword.successTitle
              : AppTexts.auth.resetPassword.title}
          description={invalidToken || sessionExpired
            ? AppTexts.auth.resetPassword.expiredDescription
            : submitted
              ? AppTexts.auth.resetPassword.successDescription
              : AppTexts.auth.resetPassword.description}
        />
        {invalidToken || sessionExpired ? (
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
            <div className="flex justify-center">
              <AuthStateIcon variant={AppConstants.authStateVariants.success}>
                <Check className="size-5" aria-hidden="true" />
              </AuthStateIcon>
            </div>
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
            {error && <AuthMessage variant={AppConstants.authMessageVariants.error}>{error}</AuthMessage>}
          </form>
        )}
        {!invalidToken && !sessionExpired && !submitted && (
          <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
            {AppTexts.auth.forgotPassword.footerPrompt} <AuthLink href={AppRoutes.pages.login}>{AppTexts.actions.signIn}</AuthLink>
          </p>
        )}
      </AuthCard>
    </AuthLayout>
  )
}