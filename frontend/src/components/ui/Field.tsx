import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

/**
 * Form primitives: every control is labelled, every hint and error is wired to
 * the control with `aria-describedby`, and errors are announced (`role="alert"`).
 * Nothing here is ever rendered without a visible label.
 */

const CONTROL_BASE =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-base text-ink-900 placeholder:text-ink-500 disabled:bg-cream-100 disabled:text-ink-500'
const CONTROL_OK = 'border-sage-300'
const CONTROL_ERROR = 'border-danger-500'

function controlClasses(invalid: boolean, extra?: string): string {
  return [CONTROL_BASE, invalid ? CONTROL_ERROR : CONTROL_OK, extra ?? ''].filter(Boolean).join(' ')
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}

function LabelText({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-base font-medium text-ink-900">
      {label}
      {required ? (
        <>
          {' '}
          <span className="text-danger-600" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  )
}

function Hint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1 text-sm text-ink-500">
      {children}
    </p>
  )
}

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1 text-sm font-medium text-danger-600">
      {children}
    </p>
  )
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  hint?: string
  error?: string
}

export function TextField({ id, label, hint, error, required, className, ...rest }: TextFieldProps) {
  return (
    <div className="flex flex-col">
      <LabelText htmlFor={id} label={label} required={required} />
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      <input
        {...rest}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClasses(Boolean(error), className)}
      />
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : null}
    </div>
  )
}

export interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id: string
  label: string
  hint?: string
  error?: string
}

export function TextAreaField({ id, label, hint, error, required, className, ...rest }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col">
      <LabelText htmlFor={id} label={label} required={required} />
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      <textarea
        {...rest}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClasses(Boolean(error), `min-h-24 ${className ?? ''}`)}
      />
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : null}
    </div>
  )
}

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> {
  id: string
  label: string
  options: SelectOption[]
  hint?: string
  error?: string
  /** Rendered as a disabled first option when the selection is empty. */
  placeholder?: string
}

export function SelectField({
  id,
  label,
  options,
  hint,
  error,
  placeholder,
  required,
  className,
  ...rest
}: SelectFieldProps) {
  return (
    <div className="flex flex-col">
      <LabelText htmlFor={id} label={label} required={required} />
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      <select
        {...rest}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClasses(Boolean(error), className)}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : null}
    </div>
  )
}

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
  hint?: string
  error?: string
}

export function CheckboxField({ id, label, hint, error, className, ...rest }: CheckboxFieldProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-3">
        <input
          {...rest}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={`mt-1 size-5 shrink-0 rounded border-sage-400 accent-sage-600 ${className ?? ''}`}
        />
        <label htmlFor={id} className="text-base text-ink-900">
          {label}
        </label>
      </div>
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : null}
    </div>
  )
}

/** Group of checkboxes with a real fieldset/legend for screen readers. */
export function CheckboxGroup({
  legend,
  hint,
  children,
  id,
}: {
  legend: string
  hint?: string
  children: ReactNode
  id: string
}) {
  return (
    <fieldset className="rounded-lg border border-cream-300 px-3 py-3" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className="px-1 text-base font-medium text-ink-900">{legend}</legend>
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}
