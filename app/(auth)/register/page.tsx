'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { AuthButton, AuthCard, AuthEmailInput, AuthHeader, AuthLayout, AuthLink, AuthMessage } from '@/components/auth/auth-layout'
import { PasswordRequirements } from '@/components/auth/password-requirements'
import { FormInput } from '@/components/ui/form-input'
import { PasswordField } from '@/components/ui/password-field'

export default function RegisterPage() {
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      setValidationError(AppTexts.validation.register)
      form.querySelector<HTMLElement>(':invalid')?.focus()
      return
    }

    const formData = new FormData(form)
    const passwordValue = String(formData.get(AppConstants.authFields.password) ?? '')
    const confirmPassword = String(formData.get(AppConstants.authFields.confirmPassword) ?? '')
    if (passwordValue.length < 8 || !/[A-Z]/.test(passwordValue) || !/[a-z]/.test(passwordValue) || !/\d/.test(passwordValue)) {
      setValidationError(AppTexts.validation.registerPasswordRequirements)
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
    <AuthLayout>
      <AuthCard>
        <AuthHeader title={AppTexts.auth.register.title} description={AppTexts.auth.register.description} />
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
          <FormInput
            id={AppConstants.authFields.fullName}
            label={AppTexts.fields.fullName}
            placeholder={AppTexts.fields.fullNamePlaceholder}
            autoComplete="name"
            required
          />
          <AuthEmailInput />
          <div className="space-y-2">
            <PasswordField
              id={AppConstants.authFields.password}
              label={AppTexts.fields.password}
              placeholder={AppTexts.fields.createPasswordPlaceholder}
              value={password}
              onValueChange={setPassword}
            />
            {password.length > 0 && <PasswordRequirements password={password} />}
          </div>
          <PasswordField
            id={AppConstants.authFields.confirmPassword}
            label={AppTexts.fields.confirmPassword}
            placeholder={AppTexts.fields.confirmPasswordPlaceholder}
            showLabel={AppTexts.password.showConfirm}
            hideLabel={AppTexts.password.hideConfirm}
          />
          <FormInput
            id={AppConstants.authFields.terms}
            type={AppConstants.inputTypes.checkbox}
            required
            wrapperClassName="items-start gap-2.5 text-[12px] leading-5"
            checkboxClassName="mt-1"
            label={(
              <>
                {AppTexts.terms.agreement} <AuthLink href={AppRoutes.links.terms}>{AppTexts.terms.service}</AuthLink> {AppTexts.terms.conjunction} <AuthLink href={AppRoutes.links.privacy}>{AppTexts.terms.privacy}</AuthLink>
              </>
            )}
          />
          <AuthButton disabled={isLoading}>
            {isLoading
              ? <><LoaderCircle className="size-4 animate-spin" />{AppTexts.auth.register.loading}</>
              : <>{AppTexts.auth.register.button}<ArrowRight className="size-4" /></>}
          </AuthButton>
          {validationError && <AuthMessage variant={AppConstants.authMessageVariants.error}>{validationError}</AuthMessage>}
          {submitted && <AuthMessage>{AppTexts.actions.previewNotice}</AuthMessage>}
        </form>
        <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
          {AppTexts.actions.alreadyHaveAccount} <AuthLink href={AppRoutes.pages.login}>{AppTexts.actions.signIn}</AuthLink>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}