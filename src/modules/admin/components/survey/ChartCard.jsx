import { useState } from 'react'
import { BarChart3, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Tarjeta de un gráfico con su vista de tabla, para leer cada valor sin
 * depender del color ni del cursor.
 */
export default function ChartCard({ title, description, table, children, className = '' }) {
  const [asTable, setAsTable] = useState(false)
  return (
    <Card className={`border-border/50 bg-card/60 ${className}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-sm">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        {table && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setAsTable(v => !v)}
            aria-pressed={asTable}
          >
            {asTable ? <><BarChart3 /> Ver gráfico</> : <><Table2 /> Ver tabla</>}
          </Button>
        )}
      </CardHeader>
      <CardContent>{asTable ? table : children}</CardContent>
    </Card>
  )
}

/** Tabla sencilla para la vista de tabla de los gráficos. */
export function DataTable({ columns, rows, caption }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border/50 text-muted-foreground">
            {columns.map(c => (
              <th key={c.key} scope="col" className={`px-2 py-2 font-medium ${c.numeric ? 'text-right' : ''}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/30 last:border-0">
              {columns.map(c => (
                <td key={c.key} className={`px-2 py-1.5 ${c.numeric ? 'text-right tabular-nums' : ''}`}>{row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
