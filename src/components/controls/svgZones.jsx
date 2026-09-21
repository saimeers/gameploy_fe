/**
 * Zonas clicables de los diagramas en SVG (mouse y mando).
 *
 * Comparten los tres estados de `ControlKey` —libre, asignada y seleccionada—
 * expresados con `currentColor`, de modo que el color sale del tema.
 */

const visual = ({ assigned, selected, interactive }) => ({
  className: [
    interactive ? 'cursor-pointer' : 'cursor-default',
    'transition-colors',
    assigned || selected ? 'text-primary' : 'text-muted-foreground',
    interactive && !assigned ? 'hover:text-foreground' : '',
    !interactive && !assigned ? 'opacity-60' : '',
  ].join(' '),
  fillOpacity: assigned ? 0.2 : selected ? 0.12 : 0.06,
  strokeWidth: assigned || selected ? 2 : 1.25,
})

function Zone({ zoneKey, assigned, selected, readOnly, onSelect, onHover, children }) {
  const interactive = !readOnly || !!assigned
  const v = visual({ assigned, selected, interactive })

  return (
    <g
      className={v.className}
      onClick={interactive ? () => onSelect?.(zoneKey) : undefined}
      onMouseEnter={interactive ? () => onHover?.(zoneKey) : undefined}
      onMouseLeave={interactive ? () => onHover?.(null) : undefined}
    >
      <title>{assigned ? `${zoneKey} — ${assigned.descripcion_accion}` : zoneKey}</title>
      {children(v)}
    </g>
  )
}

function ZoneLabel({ x, y, fontSize, children }) {
  if (!children) return null
  return (
    <text x={x} y={y + fontSize / 3} fill="currentColor" fontSize={fontSize} textAnchor="middle">
      {children}
    </text>
  )
}

export function ZonePath({ d, label, labelX, labelY, fontSize = 9, ...zone }) {
  return (
    <Zone {...zone}>
      {(v) => (
        <>
          <path
            d={d}
            fill="currentColor"
            fillOpacity={v.fillOpacity}
            stroke="currentColor"
            strokeWidth={v.strokeWidth}
          />
          <ZoneLabel x={labelX} y={labelY} fontSize={fontSize}>{label}</ZoneLabel>
        </>
      )}
    </Zone>
  )
}

export function ZoneRect({ x, y, width, height, rx = 3, label, fontSize = 8, ...zone }) {
  return (
    <Zone {...zone}>
      {(v) => (
        <>
          <rect
            x={x} y={y} width={width} height={height} rx={rx}
            fill="currentColor"
            fillOpacity={v.fillOpacity}
            stroke="currentColor"
            strokeWidth={v.strokeWidth}
          />
          <ZoneLabel x={x + width / 2} y={y + height / 2} fontSize={fontSize}>{label}</ZoneLabel>
        </>
      )}
    </Zone>
  )
}

export function ZoneCircle({ cx, cy, r, label, fontSize = 9, ...zone }) {
  return (
    <Zone {...zone}>
      {(v) => (
        <>
          <circle
            cx={cx} cy={cy} r={r}
            fill="currentColor"
            fillOpacity={v.fillOpacity}
            stroke="currentColor"
            strokeWidth={v.strokeWidth}
          />
          <ZoneLabel x={cx} y={cy} fontSize={fontSize}>{label}</ZoneLabel>
        </>
      )}
    </Zone>
  )
}
