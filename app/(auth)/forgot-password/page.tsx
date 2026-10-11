'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, LoaderCircle, Mail } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { AuthButton, AuthCard, AuthEmailInput, AuthHeader, AuthLayout, AuthLink, AuthMessage } from '@/components/auth/auth-layout'
import { useAuthApis } from '@/hooks/useAuthApis'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const {
    handleForgotPasswordRequest,
    handleVerifyOtpRequest,
    clearAuthError,
    loading,
    error,
  } = useAuthApis()
  const [validationError, setValidationError] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [resendAvailableAt, setResendAvailableAt] = useState(0)
  const [resendSeconds, setResendSeconds] = useState(0)
  const submitted = step === 'otp'

  useEffect(() => {
    if (resendAvailableAt === 0) {
      setResendSeconds(0)
      return
    }

    const updateCountdown = () => {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((resendAvailableAt - Date.now()) / 1000),
      )
      setResendSeconds(remainingSeconds)
    }

    updateCountdown()
    const interval = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(interval)
  }, [resendAvailableAt])

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
    const normalizedEmail = String(formData.get(AppConstants.authFields.email) ?? '').trim()
    handleForgotPasswordRequest(
      { email: normalizedEmail },
      () => {
        setEmail(normalizedEmail)
        setStep('otp')
        setResendAvailableAt(Date.now() + 60_000)
      },
    )
  }

  function handleResendCode() {
    if (resendSeconds > 0 || loading) {
      return
    }

    clearAuthError()
    setVerifyError('')
    handleForgotPasswordRequest({ email }, () => {
      setOtp('')
      setResendAvailableAt(Date.now() + 60_000)
    })
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      setVerifyError('Enter the 6-digit code from your email.')
      return
    }

    setVerifyError('')
    setIsVerifying(true)

    try {
      const resetToken = await handleVerifyOtpRequest({ email, otp })
      window.sessionStorage.setItem(
        AppConstants.passwordResetSessionKeys.email,
        email,
      )
      window.sessionStorage.setItem(
        AppConstants.passwordResetSessionKeys.token,
        resetToken,
      )
      router.push(AppRoutes.pages.resetPassword)
    } catch (error) {
      setVerifyError(
        error instanceof Error ? error.message : 'The code could not be verified.',
      )
    } finally {
      setIsVerifying(false)
    }
  }

  function handleChangeEmail() {
    setStep('email')
    setOtp('')
    setVerifyError('')
    setResendAvailableAt(0)
    clearAuthError()
  }

  return (
    <AuthLayout pageName={AppTexts.pageNames.forgotPassword}>
      <AuthCard>
        <AuthHeader
          title={submitted ? AppTexts.auth.forgotPassword.otpTitle : AppTexts.auth.forgotPassword.title}
          description={submitted
            ? `${AppTexts.auth.forgotPassword.otpDescription} ${email}`
            : AppTexts.auth.forgotPassword.description}
        />
        {submitted ? (
          <form
            className="space-y-4"
            onSubmit={handleOtpSubmit}
            onChange={() => setVerifyError('')}
            noValidate
            aria-busy={isVerifying}
          >
            <div className="space-y-1.5">
              <label
                htmlFor="otp"
                className="block text-[13px] font-medium text-foreground"
              >
                Verification code
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                    setVerifyError('')
                  }}
                  placeholder="000000"
                  aria-label="6-digit verification code"
                  aria-invalid={Boolean(verifyError)}
                  className="h-12 w-full rounded-md border border-input bg-background/70 pl-10 pr-3 text-center font-mono text-xl tracking-[0.55em] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 hover:border-border focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20"
                />
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                The code expires in 10 minutes.
              </p>
            </div>
            <AuthButton disabled={isVerifying || otp.length !== 6}>
              {isVerifying
                ? <><LoaderCircle className="size-4 animate-spin" />{AppTexts.auth.forgotPassword.otpLoading}</>
                : <>{AppTexts.auth.forgotPassword.otpButton}<ArrowRight className="size-4" /></>}
            </AuthButton>
            {verifyError && (
              <AuthMessage variant={AppConstants.authMessageVariants.error}>
                {verifyError}
              </AuthMessage>
            )}
            {error && (
              <AuthMessage variant={AppConstants.authMessageVariants.error}>
                {error}
              </AuthMessage>
            )}
            <p className="text-center text-[13px] text-muted-foreground">
              Didn&apos;t receive a code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendSeconds > 0 || loading || isVerifying}
                className="font-medium text-violet-300 transition-colors hover:text-violet-200 disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                {resendSeconds > 0
                  ? `Resend in ${resendSeconds}s`
                  : loading
                    ? 'Sending...'
                    : 'Resend code'}
              </button>
            </p>
            <button
              type="button"
              onClick={handleChangeEmail}
              disabled={isVerifying}
              className="flex w-full items-center justify-center gap-2 py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
            >
              <ArrowLeft className="size-3.5" />
              {AppTexts.auth.forgotPassword.otpChangeEmail}
            </button>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
            onChange={() => {
              setValidationError('')
              clearAuthError()
            }}
            noValidate
            aria-busy={loading}
          >
            <AuthEmailInput />
            <AuthButton disabled={loading}>
              {loading
                ? <><LoaderCircle className="size-4 animate-spin" />{AppTexts.auth.forgotPassword.loading}</>
                : <>{AppTexts.auth.forgotPassword.button}<ArrowRight className="size-4" /></>}
            </AuthButton>
            {validationError && <AuthMessage variant={AppConstants.authMessageVariants.error}>{validationError}</AuthMessage>}
            {error && <AuthMessage variant={AppConstants.authMessageVariants.error}>{error}</AuthMessage>}
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