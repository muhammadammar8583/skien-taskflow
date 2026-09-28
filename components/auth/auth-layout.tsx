import Link from 'next/link'
import { PanelsTopLeft, Mail } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import AppRoutes from '@/helpers/AppRoutes'
import { FormInput } from '@/components/ui/form-input'

const primaryActionClassName = 'flex h-10 w-full items-center justify-center gap-2 rounded-md bg-violet-500 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 active:translate-y-px disabled:pointer-events-none disabled:opacity-60'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0_/_2%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0_/_2%)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
      />
      <div className="relative z-10 w-full max-w-[440px]">
        <Link href={AppRoutes.pages.dashboard} className="mx-auto mb-8 flex w-fit items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span className="flex size-8 items-center justify-center rounded-md border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <PanelsTopLeft className="size-4" strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">{AppTexts.brand.productName}<span className="text-muted-foreground">{AppTexts.brand.companySuffix}</span></span>
        </Link>
        {children}
        <footer className="mt-6 text-center text-xs text-muted-foreground">
          <span>{AppTexts.brand.copyright}</span>
          <span className="mx-2 text-border">{AppTexts.brand.footerSeparator}</span>
          <Link href={AppRoutes.pages.dashboard} className="transition-colors hover:text-foreground">{AppTexts.brand.backToWorkspace}</Link>
        </footer>
      </div>
    </main>
  )
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return <section className="rounded-md border border-border bg-card px-5 py-6 shadow-2xl shadow-black/10 sm:px-8 sm:py-8">{children}</section>
}

export function AuthHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-7">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{description}</p>
    </header>
  )
}

export function AuthEmailInput() {
  return (
    <FormInput
      id={AppConstants.authFields.email}
      label={AppTexts.fields.email}
      type={AppConstants.inputTypes.email}
      placeholder={AppTexts.fields.emailPlaceholder}
      autoComplete="email"
      required
      startAdornment={<Mail className="size-4" aria-hidden="true" />}
    />
  )
}

export function AuthButton({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={primaryActionClassName}
    >
      {children}
    </button>
  )
}

export function AuthActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className={primaryActionClassName}>{children}</Link>
}

export function AuthStateIcon({ variant, children }: { variant: typeof AppConstants.authStateVariants[keyof typeof AppConstants.authStateVariants]; children: React.ReactNode }) {
  const styles = variant === AppConstants.authStateVariants.success
    ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300'
    : 'border-amber-400/20 bg-amber-400/[0.06] text-amber-300'
  return <div className={`flex size-11 items-center justify-center rounded-md border ${styles}`}>{children}</div>
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 py-0.5" aria-hidden="true">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground">{AppTexts.actions.divider}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

export function AuthMessage({ children, variant = AppConstants.authMessageVariants.notice }: { children: React.ReactNode; variant?: typeof AppConstants.authMessageVariants[keyof typeof AppConstants.authMessageVariants] }) {
  return (
    <p role={variant === AppConstants.authMessageVariants.error ? 'alert' : 'status'} className={variant === AppConstants.authMessageVariants.error
      ? 'rounded-md border border-red-400/20 bg-red-400/[0.06] px-3 py-2.5 text-xs leading-5 text-red-200'
      : 'rounded-md border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2.5 text-xs leading-5 text-amber-200'}>
      {children}
    </p>
  )
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="font-medium text-violet-300 transition-colors hover:text-violet-200">{children}</Link>
}