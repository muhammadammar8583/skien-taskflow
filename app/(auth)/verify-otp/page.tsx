'use client'

import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { AuthButton, AuthCard, AuthHeader, AuthLayout, AuthLink, AuthMessage } from '@/components/auth/auth-layout'

const OTP_LENGTH = 6

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, () => ''))
  const [validationError, setValidationError] = useState('')
  const [previewNotice, setPreviewNotice] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const isComplete = otp.every(Boolean)

  function updateOtp(startIndex: number, value: string) {
    const enteredDigits = value.replace(/\D/g, '').slice(0, OTP_LENGTH - startIndex)
    setOtp((currentOtp) => {
      const nextOtp = [...currentOtp]
      nextOtp[startIndex] = ''
      enteredDigits.split('').forEach((digit, offset) => {
        nextOtp[startIndex + offset] = digit
      })
      return nextOtp
    })

    if (enteredDigits.length > 0) {
      inputRefs.current[Math.min(startIndex + enteredDigits.length, OTP_LENGTH - 1)]?.focus()
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPreviewNotice(false)
    if (!isComplete) {
      setValidationError(AppTexts.validation.verifyOtp)
      inputRefs.current[otp.findIndex((digit) => !digit)]?.focus()
      return
    }

    setValidationError('')
    setPreviewNotice(true)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    updateOtp(index, event.clipboardData.getData('text'))
  }

  return (
    <AuthLayout pageName={AppTexts.pageNames.verifyOtp}>
      <AuthCard>
        <div className="mb-5">
          <span className="flex size-11 items-center justify-center rounded-md border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
        </div>
        <AuthHeader title={AppTexts.auth.verifyOtp.title} description={AppTexts.auth.verifyOtp.description} />
        <form
          className="space-y-5"
          onSubmit={handleSubmit}
          onChange={() => {
            setValidationError('')
            setPreviewNotice(false)
          }}
          noValidate
        >
          <div className="space-y-2">
            <fieldset className="w-full min-w-0 border-0 p-0">
              <legend className="sr-only">{AppTexts.auth.verifyOtp.codeLabel}</legend>
              <div className="grid w-full min-w-0 grid-cols-6 gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`${AppTexts.auth.verifyOtp.digitLabel} ${index + 1}`}
                    value={digit}
                    onChange={(event) => updateOtp(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={(event) => handlePaste(index, event)}
                    className="h-14 w-full min-w-0 rounded-md border border-input bg-background text-center text-xl font-semibold text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                  />
                ))}
              </div>
            </fieldset>
            {validationError && <AuthMessage variant={AppConstants.authMessageVariants.error}>{validationError}</AuthMessage>}
            {previewNotice && <AuthMessage>{AppTexts.actions.previewNotice}</AuthMessage>}
          </div>
          <AuthButton>
            {AppTexts.auth.verifyOtp.button}<ArrowRight className="size-4" />
          </AuthButton>
        </form>
        <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
          <AuthLink href={AppRoutes.pages.login}>
            <span className="inline-flex items-center gap-1.5"><ArrowLeft className="size-3.5" />{AppTexts.auth.verifyOtp.backToSignIn}</span>
          </AuthLink>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
