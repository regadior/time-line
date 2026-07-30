# time-line

Una línea de tiempo **profesional renderizada como un _git graph_**. La rama
troncal (`main`) es tu trayectoria; cada empresa es una rama que sale del
tronco, cada proyecto una sub-rama, y cada hito un commit. Toda la información
vive en un único JSON validado.

> `git log --graph --all` de mi carrera.

## La metáfora

| Concepto git            | En el timeline                                             |
| ----------------------- | ---------------------------------------------------------- |
| `main` / `develop`      | El troncal de tu trayectoria                               |
| Branch (`plexus`)       | Una **empresa** — forkea al entrar, mergea al salir        |
| Branch abierta (HEAD)   | **Empresa actual** (aún sin merge)                         |
| Sub-branch              | Un **proyecto** dentro de la empresa                       |
| Ramas en paralelo       | **Proyectos simultáneos** (carriles distintos)             |
| Commit ●                | Un **hito / actividad** del proyecto                       |
| Merge commit            | Proyecto **terminado**                                     |
| Tag / badge             | **Tecnologías y herramientas**                             |

## Stack

- **React 19** + **Vite** + **TypeScript** (modo estricto)
- **Tailwind CSS v4** para estilos (tema claro/oscuro con tokens semánticos)
- **Zod** para validar el JSON de datos en tiempo de carga
- **Renderer SVG propio** — el layout de ramas/carriles/merges es lógica pura y
  testeada; nada de librerías de git-graph
- **i18n ES/EN** — selector en la cabecera; interfaz y contenido bilingües, con
  fechas por locale
- **Vitest** + **Testing Library** para tests
- **ESLint** (flat config) + **Prettier**

## Puesta en marcha

Requiere **Node ≥ 20** y **pnpm** (ver `.nvmrc` / `packageManager`).

```bash
pnpm install
pnpm dev          # servidor de desarrollo
```

Otros scripts:

```bash
pnpm build        # tsc -b && vite build  → dist/
pnpm preview      # sirve el build
pnpm test         # vitest run
pnpm test:watch   # vitest en watch
pnpm lint         # eslint
pnpm format       # prettier --write
pnpm typecheck    # tsc -b
```

## Despliegue

Se publica en **https://timeline.regadior.dev** mediante GitHub Actions
(`.github/workflows/deploy.yml`) en cada push a `main`.

Configuración inicial (una sola vez):

1. **Settings → Pages → Build and deployment → Source: _GitHub Actions_**
2. **Settings → Pages → Custom domain:** `timeline.regadior.dev` → _Save_
3. DNS del dominio: registro **CNAME** de `timeline` → `regadior.github.io`
4. Cuando GitHub valide el DNS y emita el certificado, marcar **Enforce HTTPS**

El dominio vive en [`public/CNAME`](public/CNAME), así que viaja con el
artefacto en cada despliegue.

## Editar tu timeline

Los datos están en [`public/data/timeline.json`](public/data/timeline.json) y
se validan contra el esquema de [`src/domain/schema.ts`](src/domain/schema.ts)
al cargar. Si el JSON no cumple el esquema, la app muestra un error legible con
el detalle de cada campo.

Forma abreviada:

```jsonc
{
  "profile": {
    "name": "Tu Nombre",
    "role": "Backend Developer",
    "defaultBranch": "main",        // "main" | "develop"
    "email": "tu@correo.com",
    "links": [{ "label": "GitHub", "url": "https://github.com/tu-usuario" }]
  },
  "companies": [
    {
      "id": "empresa",
      "name": "Empresa",
      "color": "#8250df",           // opcional, hex
      "start": "2023-08",           // YYYY-MM
      "end": null,                  // null = actual (rama abierta)
      "projects": [
        {
          "id": "proyecto",
          "name": "Proyecto",
          "start": "2023-08",
          "end": "2024-07",         // null = en curso
          "summary": { "es": "…", "en": "…" },
          "commits": [{ "es": "Hito 1", "en": "Milestone 1" }],
          "tech": ["NestJS", "PostgreSQL"],
          "tools": ["VS Code", "DBeaver"]
        }
      ]
    }
  ]
}
```

Cambiar `defaultBranch` a `"develop"` renombra el troncal (el guiño a GitFlow).

Los campos de texto (`tagline`, `name`, `summary`, `commits`) admiten **string
simple** (mismo texto en ambos idiomas, útil para nombres propios) o un objeto
**`{ "es": "…", "en": "…" }`**. Si falta `en`, se muestra el `es`. El selector
**ES · EN** está en la cabecera y recuerda tu elección.

## Estructura

```
src/
├─ domain/      esquema Zod + tipos inferidos (fuente de verdad)
├─ data/        carga y validación del JSON
├─ graph/       modelo, motor de layout (puro) y renderer SVG
├─ components/  cabecera, panel de detalle, leyenda, badges…
├─ hooks/       carga de datos y tema claro/oscuro
└─ lib/         fechas, colores, hash
```

## Sobre los colores

La paleta categórica de las ramas es la paleta por defecto validada de la guía
de visualización de datos, verificada con su script contra las superficies real
(claro `#ffffff` / oscuro `#0d1117`) para separación de daltonismo y contraste.
Un par de tonos en claro caen en la banda de aviso de CVD, algo aceptable
**solo con codificación secundaria**: cada rama tiene además su propio carril
(posición) y una etiqueta de texto, así que la identidad nunca depende solo del
color.
