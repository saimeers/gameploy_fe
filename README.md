# Gameploy — Frontend

Interfaz web de **Gameploy**, el aplicativo para el despliegue y la gestión de Juegos Serios del
Semillero VIRAL (Universidad Francisco de Paula Santander).

Es una SPA que cubre el catálogo público de juegos, la ejecución de los builds Unity WebGL en el
navegador y los paneles de estudiante, docente y administrador.

- Backend: [`gameploy_be`](https://github.com/saimeers/gameploy_be)

## Stack

| Área | Tecnología |
| :--- | :--- |
| Framework | React 19 + Vite 8 |
| Estilos | Tailwind CSS 4 (plugin `@tailwindcss/vite`, sin archivo de configuración) |
| Componentes | shadcn/ui sobre Radix, iconos de `lucide-react` |
| Rutas | React Router 7 (`createBrowserRouter`) |
| Estado global | Zustand con persistencia en `localStorage` |
| HTTP | Axios con interceptores |
| Autenticación | Firebase Authentication (SDK cliente) |
| Notificaciones | `sonner` |
| Animación | `motion`, `gsap`, `lenis`, `ogl` |

## Requisitos previos

- Node.js >= 20 (desarrollado sobre 22.x) y npm
- La API de `gameploy_be` corriendo y accesible
- Un proyecto de Firebase con Email/Password y Google habilitados

## Puesta en marcha

```bash
git clone https://github.com/saimeers/gameploy_fe.git
cd gameploy_fe
npm install

cp .env.example .env        # completar con los valores reales

npm run dev                 # http://localhost:5173
```

El origen del servidor de desarrollo debe coincidir con la variable `FRONTEND_URL` del backend, que
es la que autoriza CORS.

## Variables de entorno

| Variable | Descripción |
| :--- | :--- |
| `VITE_API_URL` | Base de la API incluyendo `/api/v1`; también es la base del iframe que ejecuta el juego |
| `VITE_API_URL_DEV` | Base alternativa usada como respaldo si `VITE_API_URL` no está definida |
| `VITE_FIREBASE_API_KEY` | Configuración del SDK cliente de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Ídem |
| `VITE_FIREBASE_PROJECT_ID` | Ídem |
| `VITE_FIREBASE_STORAGE_BUCKET` | Ídem |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Ídem |
| `VITE_FIREBASE_APP_ID` | Ídem |

Todo lo que empieza por `VITE_` queda incrustado en el bundle y es visible públicamente: nunca poner
allí secretos de servidor. El archivo `.env` está en `.gitignore`; al añadir una variable, reflejarla
también en `.env.example` y en esta tabla.

## Scripts

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `dist/` |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run preview` | Sirve localmente el build de producción |
| `npm test` | Ejecuta la batería de pruebas (Vitest) |
| `npm run test:watch` | Pruebas en modo vigilancia |
| `npm run test:coverage` | Pruebas con informe de cobertura |

## Pruebas

Vitest con jsdom y Testing Library. Los archivos de prueba viven junto al código que
verifican, con la extensión `.test.js` o `.test.jsx`; la configuración está en el bloque
`test` de `vite.config.js` y el arranque en `src/test/setup.js`, que rellena lo que jsdom
no implementa (`ResizeObserver` y `matchMedia`).

Las pruebas se escriben desde lo que ve la persona usuaria: se busca por rol, texto o
etiqueta accesible, nunca por clases de CSS.

## Estructura del proyecto

```
src/
├── router/index.jsx     Definición de todas las rutas
├── components/
│   ├── game/            GamePlayer y useGameLoading: reproductor de los builds Unity WebGL
│   ├── files/           Vistas previas de archivos (imágenes, contenido del .zip, probar versión)
│   ├── visits/          VisitOrigins: origen de las visitas por país y ciudad
│   ├── HoldConfirmDialog  Confirmación de acciones destructivas manteniendo pulsado
│   ├── layout/          DashboardLayout, AppSidebar, NavMain, NavUser
│   ├── ui/              Componentes de shadcn/ui (TypeScript)
│   ├── ProtectedRoute   Guarda de rutas por rol
│   └── ...              Componentes visuales (Aurora, CardSwap, ScrollStack, ...)
├── modules/
│   ├── auth/            Login, registro, recuperación de contraseña
│   ├── student/         Panel del estudiante: proyectos, versiones, controles
│   ├── teacher/         Panel del docente: explorar y evaluar
│   └── admin/           Panel de administración: usuarios, proyectos, catálogo
├── pages/               Vistas públicas: inicio, catálogo, ficha del juego, pendiente
├── services/            api.js (instancia de axios) y auth.service.js (Firebase)
├── store/authStore.js   Sesión persistida
└── lib/                 firebase.js y utilidades (cn)
```

Cada módulo agrupa sus `pages/`, `components/`, `services/` y `hooks/`. El alias `@` apunta a `src/`.

## Convenciones

- **Acceso a datos**: las páginas nunca llaman a `axios` directamente; usan el `*.service.js` de su
  módulo, que a su vez envuelve la instancia de `@/services/api`. Esa instancia añade el token de la
  sesión a cada petición y limpia la sesión ante un 401.
- **Estado del servidor**: se maneja con `useState` + `useEffect` en las páginas. El proyecto no usa
  TanStack Query; mantener el mismo patrón hasta que se decida migrar.
- **Sesión**: `useAuthStore` (Zustand, persistido bajo la clave `gameploy-auth`) guarda `token`,
  `user` y `photoURL`. La lógica de inicio de sesión vive en `modules/auth/hooks/useAuth.js`.
- **Rutas protegidas**: se envuelven con `<ProtectedRoute allowedRoles={[...]}>`; la navegación
  lateral por rol se declara en `navByRole` dentro de `AppSidebar`.
- **Interfaz**: componentes de `@/components/ui`, iconos de `lucide-react` y composición de clases
  con `cn()` de `@/lib/utils`. Para avisos al usuario, `toast` de `sonner`; nunca `alert`.
- **Idioma**: todo el texto visible está en español; los identificadores y comentarios siguen la
  convención del código.

## Roles y navegación

| Rol | Ruta inicial | Puede |
| :--- | :--- | :--- |
| `estudiante` | `/student` | Crear y gestionar sus proyectos, versiones, archivos y controles |
| `docente` | `/teacher` | Explorar el catálogo, comentar y calificar, revisar sus evaluaciones |
| `admin` | `/admin` | Métricas, usuarios, aprobación de cuentas, proyectos y catálogo |
| `pendiente` | `/pending` | Esperar la aprobación de un administrador |
| Sin cuenta | `/`, `/games`, `/games/:slug`, `/games/:slug/jugar` | Ver el catálogo público y jugar |

Tras iniciar sesión, `useAuth` redirige según el rol devuelto por la API.

## Publicación y ejecución de un juego

1. El estudiante crea el proyecto y una versión desde `/student`.
2. Sube el `.zip` exportado desde Unity. Junto a la subida hay una guía paso a paso
   (`UnityWebGLGuide`) con la configuración que se pide:
   - plataforma **Web** (WebGL) en *Build Profiles* / *Build Settings*;
   - *Player Settings → Resolution and Presentation*: lienzo de **1920 × 1080** y plantilla
     **PWA**, que hace que el canvas ocupe todo el reproductor y la pantalla completa;
   - *Player Settings → Publishing Settings*: **Compression Format: Disabled**.

   Antes de enviarlo, el navegador lo valida con `jszip` (`modules/student/webglBuild.js`): debe
   contener `index.html`, las carpetas `Build/` y `TemplateData/`, y dentro de `Build/` los archivos
   `.loader.js`, `.framework.js`, `.data` y `.wasm`. Un build comprimido (`.gz`, `.br`,
   `.unityweb`) se rechaza, porque los archivos se sirven sin la cabecera `Content-Encoding` y el
   navegador no podría cargarlo; sin la plantilla PWA solo se avisa.
   Máximo 500 MB.
3. Añade portada, capturas, instrucciones y los controles del juego.
4. Publica el proyecto y elige su visibilidad: `publico` (aparece en el catálogo), `por_enlace`
   (accesible solo con la URL) o `privado`.
5. La ficha pública queda en `/games/<slug>`, donde el juego se ejecuta dentro de un `<iframe>`. El
   reproductor (`components/game/GamePlayer`) es 16:9, muestra la portada hasta que se pulsa jugar y
   permite reiniciar, ponerlo en pantalla completa y abrirlo en otra pestaña; donde no existe la
   Fullscreen API (Safari en iPhone) cubre la ventana con un modo inmersivo. "Nueva pestaña" abre
   `/games/<slug>/jugar` (`pages/GamePlayPage`), el juego solo a toda la ventana, que pide la ficha
   a la API con las mismas reglas de visibilidad. En los diálogos "Probar" del estudiante y del
   admin ese botón no aparece.

   Mientras carga muestra el progreso real de Unity: la API inyecta en el `index.html` del juego un
   script que envía con `postMessage` los mensajes `boot`, `progress` (0 a 1), `ready` y `error`
   (fuente `gameploy-player`), y `useGameLoading` los convierte en porcentaje de descarga, fase de
   inicio y errores con botón de reintentar. Con una API sin ese script, el juego se da por listo
   cuando carga el iframe.
   **Acceso a los archivos.** El juego y las imágenes se sirven desde el CDN
   (`cdn-gameploy.saimers.dev`) con enlaces firmados que vencen en unas horas. El frontend no los
   construye ni los pide aparte: la API añade `play_url` al build y `url` a cada imagen solo en las
   respuestas que el usuario tiene derecho a ver (ficha según visibilidad, sus proyectos, panel de
   admin), así que la ficha cuesta una sola petición. `gameUrl` (`components/files/fileFormat.js`)
   toma ese enlace y, para builds subidos antes del CDN, recurre a `${VITE_API_URL}/play/...`, que
   solo sirve la versión activa de proyectos publicados y no privados. El `.zip` original se
   descarga con un enlace de 5 minutos que firma la API solo para el dueño
   (`studentService.downloadFile`) o el admin (`adminService.downloadFile`).
6. El estudiante puede cambiar el enlace (`SlugEditor`, en la pestaña Información). El slug
   anterior sigue funcionando: la ficha pública reemplaza en la URL un slug viejo por el actual sin
   volver a pedir el proyecto (`hooks/use-public-game.js`).
7. Cada visita guarda país, región y ciudad (la API los calcula con una base offline y no guarda la
   IP), y cuenta una vez por visitante cada 30 minutos: recargar la ficha no suma visitas. `VisitOrigins` los muestra en el panel del admin, en el del estudiante y en la pestaña
   Visitas del detalle de cada proyecto.

## Acciones destructivas

Borrar o desactivar algo (proyectos, archivos, comentarios, controles, usuarios, categorías y
etiquetas) pide mantener pulsado un botón: `HoldConfirmDialog`, sobre el `HoldButton` de React Bits.
Rojo para borrar, ámbar para desactivar; activar es un clic. Las categorías y etiquetas se desactivan
en vez de borrarse: los proyectos que las usan las conservan, y solo se puede eliminar lo que ningún
proyecto usa.

## Despliegue

Pensado para Vercel: `vercel.json` reescribe todas las rutas a `/index.html` para que el enrutamiento
del lado del cliente funcione con enlaces profundos. Configurar las variables `VITE_*` en el panel del
proyecto y apuntar `VITE_API_URL` a la API de producción. El build es `npm run build` y el directorio
publicado, `dist/`.

## Contribución

### Ramas

`main` es la única rama permanente y debe permanecer siempre desplegable. Todo cambio se hace en una
rama corta que nace de `main` y se elimina tras integrarse:

```
feat/<tema>      fix/<tema>      refactor/<tema>
docs/<tema>      chore/<tema>    style/<tema>
```

```bash
git switch main && git pull
git switch -c feat/project-detail-tabs
# ... commits ...
git push -u origin feat/project-detail-tabs   # y abrir Pull Request hacia main
```

### Commits

Se usan [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance opcional>): <descripción en imperativo y minúscula>
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
Alcances habituales en este repositorio: `auth`, `student`, `teacher`, `admin`, `home`, `games`,
`ui`, `router`, `store`.

```
feat(student): add screenshot gallery to project detail
fix(auth): keep Google session when completing registration
docs(readme): document environment variables
```

Un cambio incompatible lleva `!` tras el alcance (`feat(router)!: ...`) o un pie
`BREAKING CHANGE: <descripción>`.

### Integración continua

`.github/workflows/ci.yml` instala, pasa el lint, ejecuta las pruebas y compila en cada push
y en cada Pull Request hacia `main`. Los tres pasos son bloqueantes. Vercel construye por su
cuenta cada push: publica una vista previa por rama y producción desde `main`.

### Antes de abrir un Pull Request

- `npm test` en verde.
- `npm run lint` sin errores.
- `npm run build` termina correctamente.
- Las pantallas tocadas se revisaron en escritorio y en móvil (RNF-08) y en tema claro y oscuro.
- Si se añadieron variables de entorno, actualizar `.env.example`.

## Contexto académico

Prototipo funcional (objetivo 3) del proyecto de investigación *Aplicativo web para el despliegue y
gestión de Juegos Serios en el Semillero VIRAL*, de Saimer Adrian Saavedra Rojas, Ingeniería de
Sistemas, Universidad Francisco de Paula Santander. Los documentos de requerimientos y arquitectura
están en el repositorio raíz del proyecto.
