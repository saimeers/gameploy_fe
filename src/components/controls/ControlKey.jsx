/**
 * Tecla o botón dibujado en un diagrama de controles.
 *
 * Estados: libre, asignada (ya tiene una acción) y seleccionada (la que se está
 * editando o consultando). En modo lectura solo las asignadas son interactivas;
 * las libres quedan atenuadas y sin respuesta.
 */
export default function ControlKey({
  label,
  display,
  assigned = null,
  selected = false,
  readOnly = false,
  onSelect,
  onHover,
  className = '',
  style,
}) {
  const interactive = !readOnly || !!assigned

  const base =
    'relative flex items-center justify-center rounded-md border px-1 text-center text-[11px] font-medium leading-tight transition-colors select-none'

  const state = assigned
    ? 'border-primary/50 bg-primary/15 text-primary hover:bg-primary/25'
    : readOnly
      ? 'border-border/40 bg-background/40 text-muted-foreground/50'
      : 'border-border/60 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'

  const ring = selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
  const title = assigned ? `${label} — ${assigned.descripcion_accion}` : label

  const content = (
    <>
      {display ?? label}
      {assigned && (
        <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </>
  )

  if (!interactive) {
    return (
      <span className={`${base} ${state} ${className}`} style={style} title={title}>
        {content}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(label)}
      onMouseEnter={() => onHover?.(label)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(label)}
      onBlur={() => onHover?.(null)}
      className={`${base} ${state} ${ring} cursor-pointer ${className}`}
      style={style}
      title={title}
      aria-pressed={selected}
    >
      {content}
    </button>
  )
}
