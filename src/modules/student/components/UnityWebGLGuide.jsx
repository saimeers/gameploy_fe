import { useState } from 'react'
import {
  BookOpen, Check, ChevronLeft, ChevronRight, File, FileArchive, Folder, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { LIMITS } from '@/lib/limits'

/** Configuración que Gameploy necesita del build, resumida en la tarjeta. */
const REQUIREMENTS = [
  { label: 'Plataforma', value: 'Web (WebGL)' },
  { label: 'Resolución', value: '1920 × 1080' },
  { label: 'Plantilla', value: 'PWA' },
  { label: 'Compresión', value: 'Disabled' },
  { label: 'Tamaño máx.', value: `${LIMITS.archivoMaxMB} MB` },
]

// ─── Maquetas del editor de Unity ─────────────────────────────────────────────
// Ilustran dónde está cada opción; usan grises fijos para parecerse a Unity en
// cualquier tema de la aplicación.

function MockWindow({ title, children }) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 text-[11px] text-zinc-300 shadow-lg">
      <div className="flex items-center gap-1.5 border-b border-zinc-700 bg-zinc-800 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-zinc-600" />
        <span className="h-2 w-2 rounded-full bg-zinc-600" />
        <span className="h-2 w-2 rounded-full bg-zinc-600" />
        <span className="ml-2 truncate text-zinc-400">{title}</span>
      </div>
      <div className="space-y-1 p-3">{children}</div>
    </div>
  )
}

function MockSection({ children }) {
  return <p className="pt-1 font-semibold text-zinc-200">▾ {children}</p>
}

/** Fila del inspector; `highlight` marca el valor que el estudiante debe poner. */
function MockField({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5 pl-3">
      <span className="truncate">{label}</span>
      <span className={cn(
        'min-w-24 rounded-sm border px-2 py-0.5 text-right font-mono',
        highlight
          ? 'border-primary bg-primary/25 text-white ring-2 ring-primary/40'
          : 'border-zinc-700 bg-zinc-800 text-zinc-400',
      )}>
        {value}
      </span>
    </div>
  )
}

function MockCheck({ label, checked, highlight }) {
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-sm px-2 py-1',
      highlight && 'bg-primary/25 text-white ring-2 ring-primary/40',
    )}>
      <span className={cn(
        'flex h-3.5 w-3.5 items-center justify-center rounded-sm border',
        checked ? 'border-primary bg-primary text-white' : 'border-zinc-600',
      )}>
        {checked && <Check className="h-2.5 w-2.5" />}
      </span>
      {label}
    </div>
  )
}

function MockButton({ children, highlight }) {
  return (
    <span className={cn(
      'inline-block rounded-sm border px-3 py-1',
      highlight
        ? 'border-primary bg-primary text-white ring-2 ring-primary/40'
        : 'border-zinc-600 bg-zinc-800 text-zinc-400',
    )}>
      {children}
    </span>
  )
}

function HubMock() {
  return (
    <MockWindow title="Unity Hub — Add modules">
      <p className="pb-1 text-zinc-500">Platforms</p>
      <MockCheck label="Android Build Support" />
      <MockCheck label="iOS Build Support" />
      <MockCheck label="WebGL Build Support" checked highlight />
      <MockCheck label="Windows Build Support" />
    </MockWindow>
  )
}

function PlatformMock() {
  const platforms = ['Windows, Mac, Linux', 'Android', 'iOS', 'Web']
  return (
    <MockWindow title="File › Build Profiles">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-0.5">
          {platforms.map(p => (
            <p key={p} className={cn(
              'rounded-sm px-2 py-1',
              p === 'Web' ? 'bg-primary/25 text-white ring-2 ring-primary/40' : 'text-zinc-400',
            )}>
              {p}
            </p>
          ))}
        </div>
        <div className="flex items-end">
          <MockButton highlight>Switch Platform</MockButton>
        </div>
      </div>
    </MockWindow>
  )
}

function ResolutionMock() {
  return (
    <MockWindow title="Project Settings › Player › Web">
      <MockSection>Resolution and Presentation</MockSection>
      <MockField label="Default Canvas Width" value="1920" highlight />
      <MockField label="Default Canvas Height" value="1080" highlight />
      <p className="pt-2 pl-3 text-zinc-400">WebGL Template</p>
      <div className="grid grid-cols-3 gap-2 pl-3">
        {['Default', 'Minimal', 'PWA'].map(t => (
          <div key={t} className={cn(
            'rounded-sm border py-3 text-center',
            t === 'PWA'
              ? 'border-primary bg-primary/25 text-white ring-2 ring-primary/40'
              : 'border-zinc-700 bg-zinc-800 text-zinc-500',
          )}>
            {t}
          </div>
        ))}
      </div>
    </MockWindow>
  )
}

function CompressionMock() {
  return (
    <MockWindow title="Project Settings › Player › Web">
      <MockSection>Publishing Settings</MockSection>
      <MockField label="Compression Format" value="Disabled ▾" highlight />
      <MockField label="Data Caching" value="✓" />
      <MockField label="Decompression Fallback" value="—" />
    </MockWindow>
  )
}

function BuildMock() {
  return (
    <MockWindow title="File › Build Profiles">
      <div className="flex flex-wrap items-center justify-end gap-2 pt-6">
        <MockButton>Build And Run</MockButton>
        <MockButton highlight>Build</MockButton>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-1.5">
        <Folder className="h-3.5 w-3.5 text-amber-400" />
        <span className="font-mono">MiJuego_Web/</span>
        <span className="ml-auto text-zinc-500">carpeta vacía</span>
      </div>
    </MockWindow>
  )
}

function SizeMock() {
  return (
    <MockWindow title="Inspector › Import Settings">
      <MockSection>Textura</MockSection>
      <MockField label="Max Size" value="1024 ▾" highlight />
      <MockCheck label="Use Crunch Compression" checked highlight />
      <MockSection>Audio</MockSection>
      <MockField label="Compression Format" value="Vorbis ▾" highlight />
    </MockWindow>
  )
}

const ZIP_TREE = [
  { name: 'index.html',           depth: 1 },
  { name: 'manifest.webmanifest', depth: 1 },
  { name: 'ServiceWorker.js',     depth: 1 },
  { name: 'Build/',               depth: 1, folder: true },
  { name: 'MiJuego.loader.js',    depth: 2 },
  { name: 'MiJuego.framework.js', depth: 2 },
  { name: 'MiJuego.data',         depth: 2 },
  { name: 'MiJuego.wasm',         depth: 2 },
  { name: 'TemplateData/',        depth: 1, folder: true },
]

function ZipMock() {
  return (
    <MockWindow title="Contenido del .zip">
      <div className="flex items-center gap-2 font-mono text-white">
        <FileArchive className="h-3.5 w-3.5 text-primary" />
        MiJuego.zip
      </div>
      {ZIP_TREE.map(({ name, depth, folder }) => {
        const Icon = folder ? Folder : File
        return (
          <div key={name} className="flex items-center gap-2 font-mono" style={{ paddingLeft: depth * 16 }}>
            <Icon className={cn('h-3.5 w-3.5', folder ? 'text-amber-400' : 'text-zinc-500')} />
            {name}
          </div>
        )
      })}
    </MockWindow>
  )
}

// ─── Pasos ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    title: 'Instala el módulo WebGL',
    body: (
      <>
        Abre <b>Unity Hub</b> y ve a <b>Installs</b>. En tu versión de Unity haz clic en el
        engranaje → <b>Add modules</b> y marca <b>WebGL Build Support</b> (en Unity 6 puede
        aparecer como <b>Web Build Support</b>).
      </>
    ),
    note: 'Si ya lo tienes instalado, pasa al siguiente paso.',
    mock: HubMock,
  },
  {
    title: 'Cambia la plataforma a Web',
    body: (
      <>
        Abre tu proyecto y ve a <b>File → Build Profiles</b> (en Unity 2022 o anterior:{' '}
        <b>File → Build Settings</b>). Elige <b>Web</b> (o <b>WebGL</b>) y pulsa{' '}
        <b>Switch Platform</b>.
      </>
    ),
    note: 'Unity vuelve a importar los assets; puede tardar unos minutos.',
    mock: PlatformMock,
  },
  {
    title: 'Resolución y plantilla PWA',
    body: (
      <>
        Abre <b>Player Settings</b> (botón de la misma ventana, o{' '}
        <b>Edit → Project Settings → Player</b>) y entra en la pestaña <b>Web</b>. En{' '}
        <b>Resolution and Presentation</b> pon <b>Default Canvas Width: 1920</b>,{' '}
        <b>Default Canvas Height: 1080</b> y en <b>WebGL Template</b> elige <b>PWA</b>.
      </>
    ),
    note: 'La plantilla PWA hace que el juego ocupe todo el reproductor y se adapte a la pantalla completa.',
    mock: ResolutionMock,
  },
  {
    title: 'Desactiva la compresión',
    body: (
      <>
        En la misma pestaña abre <b>Publishing Settings</b> y en <b>Compression Format</b>{' '}
        elige <b>Disabled</b>.
      </>
    ),
    note: 'Gameploy sirve los archivos tal cual: un build comprimido con Gzip o Brotli no carga y se rechaza al subirlo.',
    mock: CompressionMock,
  },
  {
    title: 'Genera el build',
    body: (
      <>
        Vuelve a <b>Build Profiles</b> y pulsa <b>Build</b>. Elige una carpeta vacía, por
        ejemplo <code className="font-mono">MiJuego_Web</code>, y espera a que termine.
      </>
    ),
    note: 'No elijas la carpeta del proyecto ni una que ya tenga archivos.',
    mock: BuildMock,
  },
  {
    title: 'Comprímelo en un .zip',
    body: (
      <>
        Abre la carpeta generada, selecciona <b>todo su contenido</b> y comprímelo: en Windows,
        clic derecho → <b>Comprimir en archivo ZIP</b> (o <b>Enviar a → Carpeta comprimida</b>);
        en macOS, clic derecho → <b>Comprimir</b>. Ese .zip es el que subes aquí.
      </>
    ),
    note: `Al subirlo, Gameploy revisa la estructura y te dice si falta algo o si el build está comprimido. El .zip puede pesar hasta ${LIMITS.archivoMaxMB} MB.`,
    mock: ZipMock,
  },
  {
    title: `Si el .zip pasa de ${LIMITS.archivoMaxMB} MB`,
    body: (
      <>
        Por ahora Gameploy acepta archivos de hasta <b>{LIMITS.archivoMaxMB} MB</b>: el servidor que
        protege la plataforma no admite subidas más grandes. Para reducir el build: en las{' '}
        <b>texturas</b>, baja <b>Max Size</b> (1024 suele bastar) y activa{' '}
        <b>Use Crunch Compression</b>; en el <b>audio</b>, usa <b>Compression Format: Vorbis</b>; en{' '}
        <b>Player Settings → Other Settings</b>, pon <b>Managed Stripping Level: High</b>; y quita de{' '}
        <b>Build Profiles</b> las escenas que no uses.
      </>
    ),
    note: 'Tras el build, el Editor Log (Console → ⋮ → Open Editor Log) lista qué assets ocupan más.',
    mock: SizeMock,
  },
]

function GuideDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const Mock = current.mock
  const isLast = step === STEPS.length - 1

  const handleOpenChange = (next) => {
    if (!next) setStep(0)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto p-0 sm:max-w-3xl bg-background text-popover-foreground">
        <div className="space-y-1 border-b border-border/50 px-6 pt-6 pb-4 pr-16">
          <DialogTitle className="text-base">Exporta tu juego desde Unity</DialogTitle>
          <DialogDescription className="text-xs">
            Sigue estos pasos una vez por proyecto; después solo tendrás que repetir el 5 y el 6.
          </DialogDescription>
        </div>

        {/* Progreso: cada segmento lleva a su paso */}
        <ol
          className="grid gap-1.5 px-6 pt-4"
          style={{ gridTemplateColumns: `repeat(${STEPS.length}, minmax(0, 1fr))` }}
          aria-label="Pasos de la guía"
        >
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? 'step' : undefined}
                aria-label={`Paso ${i + 1}: ${s.title}`}
                className="group w-full space-y-1.5 text-left"
              >
                <span className={cn(
                  'block h-1 rounded-full transition-colors',
                  i <= step ? 'bg-primary' : 'bg-border group-hover:bg-muted-foreground/40',
                )} />
                <span className={cn(
                  'hidden text-[10px] font-medium uppercase tracking-wider sm:block',
                  i === step ? 'text-foreground' : 'text-muted-foreground',
                )}>
                  Paso {i + 1}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="grid gap-6 px-6 py-5 md:grid-cols-2 md:items-center">
          <div className="space-y-3">
            <p className="text-xs font-medium text-primary">Paso {step + 1} de {STEPS.length}</p>
            <h3 className="text-lg font-semibold leading-tight">{current.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground [&_b]:font-medium [&_b]:text-foreground">
              {current.body}
            </p>
            <p className="flex gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              {current.note}
            </p>
          </div>
          <Mock />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/50 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={step === 0}
            onClick={() => setStep(s => s - 1)}
          >
            <ChevronLeft /> Anterior
          </Button>
          {isLast ? (
            <Button type="button" size="sm" onClick={() => handleOpenChange(false)}>
              <Check /> Entendido
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={() => setStep(s => s + 1)}>
              Siguiente <ChevronRight />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Tarjeta junto a la subida del .zip con la configuración que debe tener el
 * build de Unity, y acceso a la guía paso a paso.
 */
export default function UnityWebGLGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium">Exporta desde Unity con esta configuración</p>
        <Button type="button" variant="outline" size="xs" onClick={() => setOpen(true)}>
          <BookOpen /> Guía paso a paso
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {REQUIREMENTS.map(r => (
          <div key={r.label} className="rounded-md border border-border/50 bg-background/60 px-2.5 py-1.5">
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.label}</dt>
            <dd className="font-mono text-xs text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-xs text-muted-foreground">
        Luego comprime en un .zip <b className="font-medium text-foreground">el contenido</b> de la
        carpeta del build: index.html, Build y TemplateData.
      </p>

      <GuideDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
