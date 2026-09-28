import type { ComponentProps, ReactNode } from 'react'

type FormInputProps = Omit<ComponentProps<'input'>, 'id' | 'name' | 'type' | 'className' | 'size'> & {
  id: string
  name?: string
  label?: ReactNode
  type?: ComponentProps<'input'>['type']
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  wrapperClassName?: string
  labelClassName?: string
  inputClassName?: string
  checkboxClassName?: string
}

export function FormInput({
  id,
  name = id,
  label,
  type = 'text',
  startAdornment,
  endAdornment,
  wrapperClassName = '',
  labelClassName = '',
  inputClassName = '',
  checkboxClassName = '',
  required = false,
  disabled,
  ...inputProps
}: FormInputProps) {
  if (type === 'checkbox') {
    const labelId = `${id}-label`

    return (
      <div className={`flex items-center gap-2 text-[13px] text-muted-foreground ${wrapperClassName}`}>
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          disabled={disabled}
          aria-labelledby={label ? labelId : undefined}
          {...inputProps}
          className={`size-3.5 shrink-0 accent-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 ${checkboxClassName}`}
        />
        {label && <div id={labelId} className={labelClassName}>{label}</div>}
      </div>
    )
  }

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && <label htmlFor={id} className={`block text-[13px] font-medium text-foreground ${labelClassName}`}>{label}</label>}
      <div className="relative">
        {startAdornment && <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground">{startAdornment}</span>}
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          disabled={disabled}
          {...inputProps}
          className={`h-10 w-full min-w-0 rounded-md border border-input bg-background/70 ${startAdornment ? 'pl-9' : 'px-3'} ${endAdornment ? 'pr-10' : 'pr-3'} text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-border focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-60 ${inputClassName}`}
        />
        {endAdornment && <span className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">{endAdornment}</span>}
      </div>
    </div>
  )
}