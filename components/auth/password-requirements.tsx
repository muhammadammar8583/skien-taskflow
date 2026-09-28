import { Check, Circle } from 'lucide-react'
import AppTexts from '@/constants/AppTexts'

const requirements = [
  { label: AppTexts.password.requirements.minLength, test: (value: string) => value.length >= 8 },
  { label: AppTexts.password.requirements.uppercase, test: (value: string) => /[A-Z]/.test(value) },
  { label: AppTexts.password.requirements.lowercase, test: (value: string) => /[a-z]/.test(value) },
  { label: AppTexts.password.requirements.number, test: (value: string) => /\d/.test(value) },
]

export function PasswordRequirements({ password }: { password: string }) {
  const metCount = requirements.filter(({ test }) => test(password)).length
  const isStrong = metCount === requirements.length

  return (
    <div aria-live="polite" className="space-y-2 rounded-md border border-border bg-background/40 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-1 flex-1 gap-1" aria-hidden="true">
          {requirements.map(({ label }, index) => (
            <span key={label} className={`flex-1 rounded-full ${index < metCount ? (isStrong ? 'bg-emerald-400' : 'bg-violet-400') : 'bg-muted'}`} />
          ))}
        </div>
        <span className={`text-[10px] font-medium ${isStrong ? 'text-emerald-400' : 'text-muted-foreground'}`}>
          {isStrong ? AppTexts.password.strength.strong : metCount >= 2 ? AppTexts.password.strength.gettingThere : AppTexts.password.strength.needsWork}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1" aria-label={AppTexts.password.requirementsTitle}>
        {requirements.map(({ label, test }) => {
          const met = test(password)
          return (
            <li key={label} className={`flex items-center gap-1.5 text-[11px] ${met ? 'text-emerald-400' : 'text-muted-foreground'}`}>
              {met ? <Check className="size-3 shrink-0" aria-hidden="true" /> : <Circle className="size-2.5 shrink-0" aria-hidden="true" />}
              {label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}