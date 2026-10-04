import { cn } from '@/lib/utils'

/**
 * Una pregunta de opción única con botones grandes. Son radios nativos, así
 * que se responden con el teclado (Tab y flechas) y los lectores de pantalla
 * los anuncian como un grupo.
 *
 * @param {{ value: string | number, label: string }[]} options
 * @param {'scale' | 'pills'} variant scale: 5 columnas con un punto; pills: botones en línea
 */
export default function ScaleQuestion({
  id, number, text, options, value, onChange, missing = false, variant = 'scale', hint,
}) {
  return (
    <fieldset
      id={id}
      aria-invalid={missing || undefined}
      className={cn(
        'scroll-mt-24 rounded-xl border p-4 transition-colors sm:p-5',
        missing ? 'border-destructive/60 bg-destructive/5' : 'border-border/50 bg-card/60',
      )}
    >
      <legend className="sr-only">{number ? `${number}. ${text}` : text}</legend>
      <p aria-hidden className="text-sm font-medium leading-snug">
        {number && <span className="mr-2 font-mono text-xs text-muted-foreground">{number}.</span>}
        {text}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}

      <div
        className={cn(
          'mt-3 grid gap-2',
          variant === 'scale' ? 'sm:grid-cols-5' : 'grid-cols-2 sm:flex sm:flex-wrap',
        )}
      >
        {options.map(option => {
          const checked = value === option.value
          return (
            <label
              key={option.value}
              className={cn(
                'relative flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-xs transition-colors',
                'focus-within:ring-2 focus-within:ring-ring/40 hover:border-primary/50',
                variant === 'scale' && 'sm:flex-col sm:justify-start sm:gap-2 sm:py-3 sm:text-center',
                checked
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border/60 bg-background/40 text-muted-foreground',
              )}
            >
              <input
                type="radio"
                name={id}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  checked ? 'border-primary' : 'border-muted-foreground/40',
                )}
              >
                {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              <span className="leading-tight">{option.label}</span>
            </label>
          )
        })}
      </div>

      {missing && (
        <p className="mt-2 text-xs text-destructive" role="alert">Elige una opción para continuar.</p>
      )}
    </fieldset>
  )
}
