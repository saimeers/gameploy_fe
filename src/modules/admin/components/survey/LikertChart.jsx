import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ESCALA } from '@/modules/survey/preguntas'
import { DataTable } from './ChartCard'
import { NIVELES, decimal, integer, percent } from './labels'

/**
 * Respuestas de cada afirmación ya orientadas: en las negativas ("Encontré la
 * plataforma muy difícil de usar") estar de acuerdo es desfavorable, así que se
 * invierten para que lo favorable quede siempre a la derecha.
 */
const oriented = (item) => (item.inversa ? [...item.respuestas].reverse() : item.respuestas)

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Leyenda">
      {NIVELES.map(n => (
        <li key={n.key} className="flex items-center gap-1.5">
          <span aria-hidden className={cn('h-2.5 w-2.5 rounded-[2px]', n.color)} />
          {n.label}
        </li>
      ))}
    </ul>
  )
}

/** Una barra divergente: lo desfavorable a la izquierda del centro y lo favorable a la derecha. */
function Row({ item, text, active, onActive }) {
  const counts = oriented(item)
  const total = counts.reduce((a, b) => a + b, 0)
  const shares = counts.map(c => (total ? (c / total) * 100 : 0))
  const left = [
    { i: 0, w: shares[0] },
    { i: 1, w: shares[1] },
    { i: 2, w: shares[2] / 2 },
  ].filter(s => s.w > 0)
  const right = [
    { i: 2, w: shares[2] / 2 },
    { i: 3, w: shares[3] },
    { i: 4, w: shares[4] },
  ].filter(s => s.w > 0)
  const summary = NIVELES.map((n, i) => `${n.label}: ${counts[i]} (${percent(counts[i], total)} %)`).join(', ')

  const segment = (s, idx, side) => (
    <span
      key={`${side}-${s.i}`}
      className={cn(
        'h-full',
        NIVELES[s.i].color,
        side === 'left' && idx === 0 && 'rounded-l-[4px]',
        side === 'right' && idx === right.length - 1 && 'rounded-r-[4px]',
      )}
      style={{ width: `${s.w}%` }}
    />
  )

  return (
    <li
      tabIndex={0}
      aria-label={`${item.item}. ${text} ${summary}. Puntaje favorable ${decimal.format(item.favorable)} de 100.`}
      onPointerEnter={onActive}
      onFocus={onActive}
      className={cn(
        'group relative grid gap-x-3 gap-y-1.5 rounded-md px-2 py-2 outline-none transition-colors sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_3rem] sm:items-center',
        'hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/40',
      )}
    >
      <p className="min-w-0 text-xs leading-snug" title={text}>
        <span className="mr-1.5 font-mono text-muted-foreground">{item.item}.</span>
        <span className="line-clamp-2">{text}</span>
        {item.inversa && (
          <span className="ml-1 inline-block rounded border border-border/60 px-1 text-[10px] text-muted-foreground">inversa</span>
        )}
      </p>

      <div className="relative flex h-5" aria-hidden>
        <div className="flex w-1/2 justify-end gap-[2px] pr-px">{left.map((s, idx) => segment(s, idx, 'left'))}</div>
        <div className="flex w-1/2 gap-[2px] pl-px">{right.map((s, idx) => segment(s, idx, 'right'))}</div>
        <span className="absolute inset-y-[-3px] left-1/2 w-px bg-foreground/40" />
      </div>

      <p className="text-right text-xs font-semibold" aria-hidden>{decimal.format(item.favorable)}</p>

      {active && (
        <div role="tooltip" className="pointer-events-none absolute right-2 top-full z-20 mt-1 min-w-52 rounded-md border border-border/60 bg-popover p-2 text-xs text-popover-foreground shadow-lg">
          {NIVELES.map((n, i) => (
            <p key={n.key} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span aria-hidden className={cn('h-2.5 w-2.5 rounded-[2px]', n.color)} /> {n.label}
              </span>
              <span>
                <strong className="font-semibold tabular-nums">{integer.format(counts[i])}</strong>
                <span className="text-muted-foreground tabular-nums"> · {percent(counts[i], total)} %</span>
              </span>
            </p>
          ))}
        </div>
      )}
    </li>
  )
}

/**
 * Detalle por afirmación como barras divergentes centradas en lo neutral, con
 * el puntaje favorable (0 a 100) al final de cada fila.
 * @param {object[]} items del resumen de la API
 * @param {string[]} texts textos de las afirmaciones, en orden
 */
export default function LikertChart({ items, texts }) {
  const [active, setActive] = useState(null)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Legend />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Puntaje (0–100)</span>
      </div>
      <ol className="space-y-0.5" onPointerLeave={() => setActive(null)} onBlur={() => setActive(null)}>
        {items.map((item, i) => (
          <Row key={item.item} item={item} text={texts[i]} active={active === i} onActive={() => setActive(i)} />
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        En las afirmaciones <span className="rounded border border-border/60 px-1 text-[10px]">inversa</span>,
        estar de acuerdo es desfavorable; se muestran invertidas para que lo favorable quede siempre a la derecha.
      </p>
    </div>
  )
}

/** Vista de tabla: cuántos eligieron cada respuesta, sin invertir. */
export function LikertTable({ items, texts }) {
  return (
    <DataTable
      caption="Respuestas por afirmación"
      columns={[
        { key: 'afirmacion', label: 'Afirmación' },
        ...ESCALA.map(e => ({ key: `r${e.value}`, label: e.label, numeric: true })),
        { key: 'acuerdo', label: 'Media (1–5)', numeric: true },
        { key: 'favorable', label: 'Puntaje favorable', numeric: true },
      ]}
      rows={items.map((item, i) => ({
        afirmacion: `${item.item}. ${texts[i]}${item.inversa ? ' (inversa)' : ''}`,
        ...Object.fromEntries(item.respuestas.map((c, j) => [`r${j + 1}`, integer.format(c)])),
        acuerdo: decimal.format(item.acuerdo),
        favorable: decimal.format(item.favorable),
      }))}
    />
  )
}
