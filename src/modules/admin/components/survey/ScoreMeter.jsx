import { cn } from '@/lib/utils'
import { decimal } from './labels'

/**
 * Escala de 0 a 100 con la media, su intervalo de confianza del 95 % y una
 * referencia. Las bandas (si las hay) son tramos del mismo gris separados por
 * un espacio, con su nombre debajo; la de la media se resalta en el texto.
 *
 * @param {number} value media
 * @param {[number, number] | null} ci intervalo de confianza del 95 %
 * @param {{ value: number, label: string }} reference
 * @param {{ id: string, label: string, from: number, to: number }[]} [bands]
 */
export default function ScoreMeter({ value, ci, reference, bands, label }) {
  const activeBand = bands?.find(b => value < b.to) ?? bands?.[bands.length - 1]
  const description = [
    `${label}: ${decimal.format(value)} de 100`,
    ci && `intervalo de confianza del 95 % entre ${decimal.format(ci[0])} y ${decimal.format(ci[1])}`,
    `${reference.label}: ${reference.value}`,
  ].filter(Boolean).join('; ')

  return (
    <div role="img" aria-label={description} className="space-y-1.5 pt-6">
      <div className="relative h-2">
        {/* Pista: tramos por banda, separados por 2 px del color de la tarjeta */}
        <div className="absolute inset-0 flex gap-[2px]">
          {(bands ?? [{ id: 'all', from: 0, to: 100 }]).map(b => (
            <span
              key={b.id}
              className="h-full rounded-[4px] bg-chart-bar-muted/40"
              style={{ width: `${b.to - b.from}%` }}
            />
          ))}
        </div>

        {/* Referencia */}
        <span
          aria-hidden
          className="absolute -top-1.5 h-5 w-px bg-foreground/50"
          style={{ left: `${reference.value}%` }}
        />
        <span
          aria-hidden
          className="absolute -top-6 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground"
          style={{ left: `${reference.value}%` }}
        >
          {reference.label} {reference.value}
        </span>

        {/* Intervalo de confianza */}
        {ci && (
          <span
            aria-hidden
            className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-chart-bar"
            style={{ left: `${ci[0]}%`, width: `${Math.max(ci[1] - ci[0], 0.5)}%` }}
          />
        )}

        {/* Media */}
        <span
          aria-hidden
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-bar ring-2 ring-card"
          style={{ left: `${value}%` }}
        />
      </div>

      <div className="flex text-[10px] text-muted-foreground">
        {bands ? bands.map(b => (
          <span
            key={b.id}
            className={cn('truncate text-center', b.id === activeBand?.id && 'font-semibold text-foreground')}
            style={{ width: `${b.to - b.from}%` }}
          >
            {b.label}
          </span>
        )) : (
          <span className="flex w-full justify-between"><span>0</span><span>100</span></span>
        )}
      </div>
    </div>
  )
}
