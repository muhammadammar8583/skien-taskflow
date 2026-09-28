'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import AppConstants from '@/constants/AppConstants'
import AppTexts from '@/constants/AppTexts'
import { Button } from './button'
import { FormInput } from './form-input'

export type PasswordFieldProps = {
  id: string
  label: string
  placeholder?: string
  autoComplete?: string
  value?: string
  onValueChange?: (value: string) => void
  required?: boolean
  showLabel?: string
  hideLabel?: string
  wrapperClassName?: string
}

export function PasswordField({
  id,
  label,
  placeholder,
  autoComplete = 'new-password',
  value,
  onValueChange,
  required = true,
  showLabel = AppTexts.password.show,
  hideLabel = AppTexts.password.hide,
  wrapperClassName,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <FormInput
      id={id}
      label={label}
      type={visible ? AppConstants.inputTypes.text : AppConstants.inputTypes.password}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      value={value}
      onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
      wrapperClassName={wrapperClassName}
      endAdornment={(
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVisible((currentVisibility) => !currentVisibility)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      )}
    />
  )
}
