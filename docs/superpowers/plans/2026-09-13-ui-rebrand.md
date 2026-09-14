# UI: rebrand completo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar a UI do Next 13.5 atual para o rebrand desenhado, sobre a organização e as ferramentas do `eleva-management-ui`, com um score automático de similaridade e responsividade que só libera o encerramento em **98/100**.

**Architecture:** O drawer com hambúrguer vira um shell fixo de três zonas montado no `layout.tsx` do grupo `(app)`. As páginas de leitura viram Server Components lendo `@/services`, o que apaga a camada `Context + react-query v3 + useState`; o que precisa de cliente (feed infinito, autocomplete de tag) usa TanStack Query v5, como na casa. NSFW ganha enforcement por cookie e middleware. Upload ganha autenticação e estado por arquivo.

**Tech Stack:** Next 16.3.5, React 19.3, Tailwind 3.4.19, Biome 2.5.13 + Prettier 3.9.6, TanStack Query 5.102.8, sonner 2.0.8, lucide-react 1.45.0, react-dropzone 20.1.1, next-auth 5 beta, Playwright 1.63, Vitest 5.

**Spec:** `docs/superpowers/plans/2026-09-13-convencoes-e-stack.md` · [canvas do rebrand](https://claude.ai/code/artifact/f2dfd88d-ab9b-42de-bf22-08db4e330172) · [Anatomia do Alcremie](https://claude.ai/code/artifact/0f8dc467-12df-4b3a-9b8b-440ccfc54b1b)

## Global Constraints

Tudo em `2026-09-13-convencoes-e-stack.md` vale aqui. O essencial:

- **npm**, nunca pnpm/yarn/bun. Commits pela skill `auto-commit`, nunca `git commit` direto.
- **Estilo:** aspas duplas, **sem ponto e vírgula**, 120 colunas, arrow functions, arquivos kebab-case, named exports (menos onde o App Router exige default).
- **Estrutura:** `src/{app,assets,components,constant,contexts,db,hooks,lib,services,styles,types,utils}`. Plural. Componente nunca importa de `@/db`, sempre de `@/services`.
- **Ícone é `lucide-react`.** Os SVG inline das pranchas são desenho; o código usa a biblioteca.
- Paleta: `#161618`, `#1B1B1F`, `#414853` e `#a78bfa` continuam. `#212128`, `#282830`, `#2E2E37` são adições.
- Tipografia: Eczar (display), Archivo (UI), JetBrains Mono (tags, rotas, métricas).
- A branch `feature/next-13-old-style` guarda o estado atual. Não mexer.
- **Gate:** a partir da Onda 2, nenhuma onda fecha com `npm run ui:score` abaixo de **98**.

---

## Onda 1 — Fundação

### Task 1: Next 16, ferramentas e estrutura da casa

**Files:**
- Create: `biome.json`, `.prettierrc`, `.prettierignore`, `.husky/pre-commit`
- Modify: `package.json`, `next.config.mjs`, `tsconfig.json`
- Delete: `next.config.js`
- Rename: seis pastas de `src/`

- [ ] **Step 1: Subir o Next**

```bash
npx @next/codemod@latest upgrade latest
```

Responder "sim" aos codemods de async request APIs. Deve chegar em `next@16.3.5`, `react@19.3.0`.

- [ ] **Step 2: Instalar as ferramentas da casa**

```bash
npm i -D @biomejs/biome@2.5.13 prettier@3.9.6 prettier-plugin-tailwindcss@0.6.5 \
  husky@9.1.7 lint-staged@17.5.1 @types/node@24.13.4
npx husky init
printf 'npx lint-staged\n' > .husky/pre-commit
```

- [ ] **Step 3: Copiar as configs**

```bash
SRC=/home/sid/www/m4all/eleva-management/eleva-management-ui
cp "$SRC/biome.json" "$SRC/.prettierrc" "$SRC/.prettierignore" "$SRC/tsconfig.json" .
sed -i 's#schemas/2\.4\.15/#schemas/2.5.13/#' biome.json
sed -i 's#"!scripts"#"!scripts", "!models", "!fixtures", "!drizzle"#' biome.json
```

- [ ] **Step 4: Scripts e lint-staged**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "biome check ./src",
  "tc": "tsc --noEmit",
  "biome:fix": "biome check --write ./src",
  "biome:format": "biome format --write ./src",
  "prepare": "husky"
},
"lint-staged": {
  "*.{ts,tsx,js,jsx}": [
    "biome check --write --no-errors-on-unmatched",
    "prettier --write --plugin prettier-plugin-tailwindcss"
  ],
  "*.json": ["biome format --write --no-errors-on-unmatched"],
  "*.css": ["prettier --write"]
}
```

- [ ] **Step 5: Renomear as pastas para o plural da casa**

```bash
git mv src/component src/components
git mv src/util src/utils
git mv src/@Types src/types
git mv src/context src/contexts
git mv src/hook src/hooks
git rm src/components/home/status/Index.ts.tsx
grep -rl "@/component/\|@/util/\|@/@Types/\|@/context/\|@/hook/" src/ | xargs sed -i \
  -e 's#@/component/#@/components/#g' \
  -e 's#@/util/#@/utils/#g' \
  -e 's#@/@Types/#@/types/#g' \
  -e 's#@/context/#@/contexts/#g' \
  -e 's#@/hook/#@/hooks/#g'
```

- [ ] **Step 6: Consertar a config de imagem — duas coisas erradas ali**

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
}

export default nextConfig
```

Duas remoções deliberadas: `unoptimized: true` (desligava o otimizador e fazia a galeria servir 35 WebP originais por página) e `hostname: "**"` (aceitava otimizar imagem de qualquer host da internet).

- [ ] **Step 7: Trocar as fontes**

```tsx
// src/app/layout.tsx — bloco de fontes
import { Archivo, Eczar, JetBrains_Mono } from "next/font/google"

const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" })
const eczar = Eczar({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" })
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" })
```

No `<html>`: `className={`${archivo.variable} ${eczar.variable} ${mono.variable} font-sans`}`.

- [ ] **Step 8: Formatar tudo de uma vez e buildar**

```bash
npm run biome:fix
npx prettier --write "src/**/*.css"
npm run tc
npm run build
```

Expected: build limpo. Este passo converte o repositório inteiro para aspas duplas e sem ponto e vírgula — o diff é enorme e é esperado.

- [ ] **Step 9: Commit** — invocar a skill `auto-commit`.

---

### Task 2: Tokens no Tailwind

**Files:**
- Modify: `tailwind.config.ts`, `src/styles/globals.css`
- Create: `src/lib/cn.ts`

**Interfaces:**
- Produces: `bg-rail`, `bg-sidebar`, `bg-content`, `bg-raise`, `border-line`, `border-line-2`, `text-accent`, `bg-accent`, `text-ink`, `text-ink-2`, `text-ink-3`, `text-ok`, `text-warn`, `font-display`, `font-mono`; `cn(...)`

- [ ] **Step 1: Estender o tema**

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rail: "#161618",
        sidebar: "#1B1B1F",
        content: "#212128",
        raise: "#282830",
        line: "#2E2E37",
        "line-2": "#414853",
        accent: { DEFAULT: "#A78BFA", soft: "#C4B5FD", deep: "#8B5CF6" },
        ink: { DEFAULT: "#F4F4F5", 2: "#A1A1AA", 3: "#71717A" },
        ok: "#34D399",
        warn: "#F0A45E",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
}

export default config
```

`lucide` sai como nome de cor — descrevia a biblioteca de ícones, não a paleta.

- [ ] **Step 2: Helper de classe**

```ts
// src/lib/cn.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
```

- [ ] **Step 3: Trocar as classes antigas**

```bash
grep -rl 'lucide-800\|lucide-600\|lucide-300\|violet-400\|violet-300\|zinc-100\|zinc-400\|zinc-500' src/ \
  | xargs sed -i \
    -e 's/lucide-800/rail/g' -e 's/lucide-600/sidebar/g' -e 's/lucide-300/line-2/g' \
    -e 's/violet-400/accent/g' -e 's/violet-300/accent-soft/g' \
    -e 's/zinc-100/ink/g' -e 's/zinc-400/ink-2/g' -e 's/zinc-500/ink-3/g'
```

- [ ] **Step 4: Conferir**

Run: `npm run dev`
Expected: o site continua parecido com antes. Esta task troca vocabulário, não desenho.

- [ ] **Step 5: Commit** — invocar a skill `auto-commit`.

---

### Task 3: O shell

**Files:**
- Create: `src/components/shell/rail.tsx`, `src/components/shell/sidebar.tsx`, `src/components/shell/nav-item.tsx`, `src/components/shell/topbar.tsx`, `src/constant/navigation.ts`, `src/app/(app)/layout.tsx`
- Modify: `src/app/layout.tsx`
- Move: as seis páginas para `src/app/(app)/`, exceto `nsfw/validation` para `src/app/(redirect)/`
- Delete: `src/components/sideNav/`, `src/components/Header.tsx`
- Test: `src/components/shell/nav-item.test.tsx`

**Interfaces:**
- Consumes: tokens (Task 2)
- Produces: `NAV_ITEMS` de `@/constant/navigation`; `<Rail />`, `<Sidebar />`, `<NavItem />`, `<Topbar icon title right? />`

**Contrato do scorer:** todo elemento do shell carrega `data-probe`. Os nomes são fixos e batem com as pranchas: `rail`, `sidebar`, `topbar`, `content`, `nav-active`, `chip`, `btn-primary`, `masonry`. Trocar ou esquecer um zera aquele pedaço da nota da Task 4.

- [ ] **Step 1: Teste do estado ativo primeiro**

O bug clássico: `/nsfw/validation` precisa marcar NSFW como ativo, e `/` não pode casar com tudo.

```tsx
// src/components/shell/nav-item.test.tsx
import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"

const renderAt = async (pathname: string, href: string) => {
  vi.resetModules()
  vi.doMock("next/navigation", () => ({ usePathname: () => pathname }))

  const { NavItem } = await import("@/components/shell/nav-item")
  const { House } = await import("lucide-react")

  render(<NavItem href={href} title="x" icon={House} />)

  return screen.getByRole("link")
}

test("Home só fica ativo na raiz", async () => {
  expect(await renderAt("/gallery", "/")).not.toHaveAttribute("aria-current")
})

test("NSFW fica ativo também em /nsfw/validation", async () => {
  expect(await renderAt("/nsfw/validation", "/nsfw")).toHaveAttribute("aria-current", "page")
})

test("Gallery não fica ativo em /", async () => {
  expect(await renderAt("/", "/gallery")).not.toHaveAttribute("aria-current")
})
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
npm i -D vitest@5.0.0 @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
npx vitest run src/components/shell/nav-item.test.tsx
```

Expected: FAIL, "Cannot find module '@/components/shell/nav-item'".

- [ ] **Step 3: Implementar**

```tsx
// src/components/shell/nav-item.tsx
"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/cn"

interface NavItemProps {
  href: string
  title: string
  icon: LucideIcon
}

export const isActiveRoute = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href)

export const NavItem = ({ href, title, icon: Icon }: NavItemProps) => {
  const pathname = usePathname()
  const isActive = isActiveRoute(pathname, href)

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      data-probe={isActive ? "nav-active" : undefined}
      className={cn(
        "flex h-[34px] items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
        isActive ? "bg-line-2 font-medium text-ink" : "text-ink-2 hover:bg-line"
      )}
    >
      <Icon size={18} strokeWidth={1.75} />
      {title}
    </Link>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/components/shell/nav-item.test.tsx`
Expected: 3 passed.

- [ ] **Step 5: A navegação como constante**

```ts
// src/constant/navigation.ts
import { GalleryVertical, House, Image, OctagonAlert, Tag, Upload } from "lucide-react"

export const NAV_ITEMS = [
  { href: "/", title: "Home", icon: House, section: "browse" },
  { href: "/recent", title: "Recent", icon: GalleryVertical, section: "browse" },
  { href: "/gallery", title: "Gallery", icon: Image, section: "browse" },
  { href: "/nsfw", title: "NSFW", icon: OctagonAlert, section: "browse" },
  { href: "/upload", title: "Upload", icon: Upload, section: "library" },
  { href: "/tags", title: "Tags", icon: Tag, section: "library" },
] as const

export const RAIL_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/tags")
```

- [ ] **Step 6: Rail, sidebar e topbar**

```tsx
// src/components/shell/rail.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RAIL_ITEMS } from "@/constant/navigation"
import { isActiveRoute } from "@/components/shell/nav-item"
import { cn } from "@/lib/cn"

export const Rail = () => {
  const pathname = usePathname()

  return (
    <div data-probe="rail" className="flex w-[72px] flex-none flex-col items-center gap-2 bg-rail py-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent font-display text-[22px] font-bold text-rail">
        A
      </div>
      <div className="my-1 h-0.5 w-8 rounded-sm bg-line" />
      {RAIL_ITEMS.map((item) => {
        const isActive = isActiveRoute(pathname, item.href)

        return (
          <Link key={item.href} href={item.href} aria-label={item.title} className="relative flex w-full justify-center">
            {isActive ? <span className="absolute left-0 top-2.5 h-6 w-1 rounded-r bg-accent" /> : null}
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center transition-all",
                isActive
                  ? "rounded-2xl bg-line-2 text-ink"
                  : "rounded-full bg-sidebar text-ink-2 hover:rounded-2xl hover:bg-line-2"
              )}
            >
              <item.icon size={22} strokeWidth={1.75} />
            </span>
          </Link>
        )
      })}
    </div>
  )
}
```

```tsx
// src/components/shell/sidebar.tsx
import { NavItem } from "@/components/shell/nav-item"
import { NAV_ITEMS } from "@/constant/navigation"

const Section = ({ label, section }: { label: string; section: string }) => (
  <>
    <div className="px-2 pb-2 pt-5 font-mono text-[10px] tracking-[0.12em] text-ink-3 first:pt-0">{label}</div>
    {NAV_ITEMS.filter((item) => item.section === section).map((item) => (
      <NavItem key={item.href} href={item.href} title={item.title} icon={item.icon} />
    ))}
  </>
)

export const Sidebar = () => (
  <aside data-probe="sidebar" className="flex w-60 flex-none flex-col bg-sidebar max-lg:hidden">
    <div className="flex h-[52px] items-center gap-2 border-b border-line px-4">
      <span className="font-display text-xl font-bold tracking-[0.02em] text-ink">Alcremie</span>
      <span className="pt-1 font-mono text-[10px] text-ink-3">v2</span>
    </div>
    <nav className="flex flex-col gap-0.5 p-2 pt-4">
      <Section label="BROWSE" section="browse" />
      <Section label="LIBRARY" section="library" />
    </nav>
  </aside>
)
```

```tsx
// src/components/shell/topbar.tsx
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface TopbarProps {
  icon: LucideIcon
  title: string
  right?: ReactNode
}

export const Topbar = ({ icon: Icon, title, right }: TopbarProps) => (
  <header data-probe="topbar" className="flex h-[52px] flex-none items-center gap-2.5 border-b border-line px-6">
    <Icon size={18} strokeWidth={1.75} className="text-ink-3" />
    <h1 className="text-[15px] font-semibold text-ink">{title}</h1>
    <div className="grow" />
    {right}
  </header>
)
```

- [ ] **Step 7: Grupos de rota e o layout do shell**

```bash
mkdir -p "src/app/(app)" "src/app/(redirect)"
git mv src/app/gallery src/app/recent src/app/nsfw src/app/upload "src/app/(app)/"
git mv src/app/page.tsx "src/app/(app)/page.tsx"
git mv "src/app/(app)/nsfw/validation" "src/app/(redirect)/nsfw-validation"
rm -rf src/components/sideNav src/components/Header.tsx
```

```tsx
// src/app/(app)/layout.tsx
import type { ReactNode } from "react"
import { Rail } from "@/components/shell/rail"
import { Sidebar } from "@/components/shell/sidebar"

const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex h-screen overflow-hidden">
    <Rail />
    <Sidebar />
    <main data-probe="content" className="flex min-w-0 grow flex-col overflow-y-auto bg-content">
      {children}
    </main>
  </div>
)

export default AppLayout
```

O grupo `(redirect)` fica **fora** do shell: o gate de idade é uma tela cheia, como na prancha.

- [ ] **Step 8: Conferir que o hambúrguer sumiu**

Run: `npm run dev`
Expected: em desktop, rail e sidebar visíveis sem clique. Em `<1024px` a sidebar some e o rail basta — o drawer mobile é a Onda 5.

- [ ] **Step 9: Commit** — invocar a skill `auto-commit`.

---

### Task 4: O medidor — score de similaridade e responsividade

**Files:**
- Create: `tests/visual/score-ui.mjs`, `tests/visual/reference/` (7 arquivos), `tests/visual/.gitignore`
- Modify: `package.json`, `.gitignore`

**Interfaces:**
- Consumes: os `data-probe` da Task 3
- Produces: `npm run ui:score` — imprime tabela por página, escreve `tests/visual/score-report/report.json`, **sai com código 1 abaixo de 98**

**Como a nota é composta:**

| Peso | Categoria | O que mede |
| --- | --- | --- |
| 40 | Estrutura | geometria (largura, altura, posição x) de cada `data-probe`, contra a prancha renderizada no mesmo browser. Tolerância cai linearmente até zero em 8px. Probe ausente conta zero |
| 20 | Cor | `backgroundColor`, `color` e `borderColor` nos mesmos pontos. Igual = 1, cai até zero numa distância RGB de 40 |
| 15 | Tipografia | família, tamanho (tolerância 3px) e peso nos mesmos pontos |
| 25 | Responsividade | checagens duras em 390, 768, 1024 e 1440. Cada problema custa 2 pontos |

As checagens de responsividade: sem scroll horizontal; nenhum elemento mais largo que a viewport fora de um container com `overflow-x`; nenhum texto abaixo de 12px; nenhum texto cortado por `overflow: hidden`; em 390px, todo alvo clicável com no mínimo 44px no menor lado; nenhum texto encostado na borda.

**Diff de pixel não entra na nota.** A prancha usa imagens de exemplo e a implementação usa o acervo real — um diff perceptual nunca chegaria a 98 por motivo legítimo. Os screenshots são gravados em `score-report/` para olho humano.

- [ ] **Step 1: Instalar e copiar**

```bash
npm i -D @playwright/test@1.63.0
npx playwright install chromium
mkdir -p tests/visual/reference
cp /home/sid/www/personal/alcremie-design/score-ui.mjs tests/visual/
cp /home/sid/www/personal/alcremie-design/ref-*.html tests/visual/reference/
cp /home/sid/www/personal/alcremie-design/a*.jpg tests/visual/reference/
printf 'score-report/\n' > tests/visual/.gitignore
```

Ajustar em `score-ui.mjs`: `const HERE` passa a apontar para `reference/` na hora de abrir as pranchas — `path.join(HERE, "reference", target.reference)`.

- [ ] **Step 2: Script**

```json
"ui:score": "node tests/visual/score-ui.mjs",
"ui:score:one": "node tests/visual/score-ui.mjs --only"
```

- [ ] **Step 3: Rodar a primeira medição**

```bash
npm run dev &
npm run ui:score
```

Expected: uma nota baixa — só o shell existe. O que importa aqui é que a tabela sai, as páginas são encontradas e os `data-probe` do shell aparecem. Se `rail`, `sidebar`, `topbar` ou `content` estiverem em "data-probe faltando", a Task 3 não terminou.

- [ ] **Step 4: Fixar a linha de base**

Anotar a nota no commit. Ela é o número que as próximas ondas precisam empurrar até 98.

- [ ] **Step 5: Commit** — invocar a skill `auto-commit`.

---

## Onda 2 — Páginas de leitura

### Task 5: Home

**Files:**
- Create: `src/components/home/hero.tsx`, `src/components/home/stat-tile.tsx`, `src/components/masonry.tsx`, `src/utils/cloudinary-url.ts`
- Modify: `src/app/(app)/page.tsx`
- Delete: `src/components/home/status/` (5 arquivos), `src/components/home/Hero.tsx`, `src/components/CustomMasonry.tsx`

**Interfaces:**
- Consumes: `getStatistics`, `randomImage`, `fetchImageFeed` (plano do banco, Task 3)
- Produces: `<Masonry images columns? />`, `cloudinaryUrl(image, width)`

- [ ] **Step 1: A URL com transformação**

```ts
// src/utils/cloudinary-url.ts
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD ?? "alcremie"

interface Transformable {
  cloudinaryId: string
  cloudinaryVersion: number
}

export const cloudinaryUrl = (image: Transformable, width: number) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/w_${width},f_auto,q_auto/v${image.cloudinaryVersion}/${image.cloudinaryId}`
```

`https`, não `http`: é a correção da URL que o `cloudinary.service.ts:37` gravava errada.

- [ ] **Step 2: Masonry sem biblioteca**

```tsx
// src/components/masonry.tsx
import NextImage from "next/image"
import type { FeedImage } from "@/types/image"
import { cloudinaryUrl } from "@/utils/cloudinary-url"

const solidBlur = (hex: string) =>
  `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="${hex}"/></svg>`
  ).toString("base64")}`

interface MasonryProps {
  images: FeedImage[]
  columns?: number
}

export const Masonry = ({ images, columns = 5 }: MasonryProps) => {
  const buckets: FeedImage[][] = Array.from({ length: columns }, () => [])
  images.forEach((image, index) => buckets[index % columns].push(image))

  return (
    <div
      data-probe="masonry"
      className="grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {buckets.map((bucket, index) => (
        <div key={`col-${index}`} className="flex flex-col gap-2.5">
          {bucket.map((image) => (
            <NextImage
              key={image.id}
              src={cloudinaryUrl(image, 400)}
              alt=""
              width={image.width}
              height={image.height}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              placeholder={image.placeholder ? "blur" : "empty"}
              blurDataURL={image.placeholder ? solidBlur(image.placeholder) : undefined}
              className="block w-full rounded-lg"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
```

Três correções sobre o `CustomMasonry` atual: dimensões reais em vez de `500×500` fixo, sem `priority` em todas as imagens, e URL com transformação em vez do original.

- [ ] **Step 3: A home como Server Component**

```tsx
// src/app/(app)/page.tsx
import { House, Image as ImageIcon, Server, Tag } from "lucide-react"
import type { Metadata } from "next"
import { Hero } from "@/components/home/hero"
import { StatTile } from "@/components/home/stat-tile"
import { Topbar } from "@/components/shell/topbar"
import { ApiStatus } from "@/components/shell/api-status"
import { fetchImageFeed, randomImage } from "@/services/images"
import { getStatistics } from "@/services/stats"

export const metadata: Metadata = { title: "Home | Alcremie" }
export const revalidate = 60

const Page = async () => {
  const [stats, random, backdrop] = await Promise.all([
    getStatistics(),
    randomImage(false),
    fetchImageFeed({ nsfw: false, limit: 14 }),
  ])

  return (
    <>
      <Topbar icon={House} title="Home" right={<ApiStatus />} />
      <Hero images={backdrop.data} />
      <div className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          <StatTile icon={ImageIcon} value={stats.images} label="IMAGES" />
          <StatTile icon={Tag} value={stats.tags} label="TAGS" />
          <StatTile icon={Server} value={stats.requests} label="REQUESTS" />
        </div>
        {random ? <RandomPanel image={random} /> : null}
      </div>
    </>
  )
}

export default Page
```

`revalidate = 60` substitui o `force-dynamic` de hoje, que garantia um full scan de ids em todo acesso à raiz.

- [ ] **Step 4: Apagar o compound component**

```bash
rm -rf src/components/home/status src/components/home/Hero.tsx src/components/CustomMasonry.tsx
npm rm react-countup
```

`Status.root / Status.item / Status.icon` eram seis arquivos para renderizar três caixas.

- [ ] **Step 5: Medir**

Run: `npm run ui:score:one home`
Expected: a nota da home sobe muito em relação à linha de base da Task 4. Se `btn-primary` ou `chip` aparecerem faltando, o Hero não recebeu os `data-probe` da prancha.

- [ ] **Step 6: Commit** — invocar a skill `auto-commit`.

---

### Task 6: Gallery e Recent

**Files:**
- Create: `src/components/gallery/tag-filter.tsx`, `src/components/gallery/pagination.tsx`, `src/components/recent/feed.tsx`, `src/components/recent/card.tsx`, `src/components/provider.tsx`, `src/hooks/gallery/use-tag-search.ts`, `src/lib/toast/toast-error.ts`, `src/lib/toast/toast-success.ts`
- Modify: `src/app/(app)/gallery/page.tsx`, `src/app/(app)/recent/page.tsx`, `src/app/layout.tsx`
- Delete: `src/contexts/useGallery.tsx`, `src/components/gallery/SideNavFilter.tsx`, `src/components/gallery/SelectPageModal.tsx`, `src/components/recent/InfiniteFetch.tsx`, `src/components/LoadingPage.tsx`, `src/app/(app)/gallery/layout.tsx`

**Interfaces:**
- Consumes: `fetchImagePage`, `fetchImagesByTag`, `searchTags`; `<Masonry />` (Task 5)
- Produces: `/gallery?page=N&tag=UUID` — estado na URL; `queryClient` de `@/components/provider`

- [ ] **Step 1: TanStack Query v5 e sonner, como na casa**

```bash
npm rm react-query axios react-toastify
npm i @tanstack/react-query@5.102.8 sonner@2.0.8
```

```tsx
// src/components/provider.tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { PhotoProvider } from "react-photo-view"

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 60_000 } },
})

export const Provider = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <PhotoProvider>{children}</PhotoProvider>
  </QueryClientProvider>
)
```

```ts
// src/lib/toast/toast-error.ts
import { toast } from "sonner"

export const toastError = (message: string) => toast.error(message)
```

Componente nunca importa `sonner` direto — é a convenção da casa.

- [ ] **Step 2: Galeria como Server Component com estado na URL**

```tsx
// src/app/(app)/gallery/page.tsx
import { Image as ImageIcon } from "lucide-react"
import type { Metadata } from "next"
import { Masonry } from "@/components/masonry"
import { Pagination } from "@/components/gallery/pagination"
import { TagFilter } from "@/components/gallery/tag-filter"
import { Topbar } from "@/components/shell/topbar"
import { fetchImagePage, fetchImagesByTag } from "@/services/images"

export const metadata: Metadata = { title: "Gallery | Alcremie" }

interface PageProps {
  searchParams: Promise<{ page?: string; tag?: string }>
}

const Page = async ({ searchParams }: PageProps) => {
  const { page: rawPage, tag } = await searchParams
  const page = Math.max(1, Number(rawPage) || 1)

  const result = tag
    ? await fetchImagesByTag({ tagId: tag, nsfw: false, limit: 35 })
    : await fetchImagePage({ nsfw: false, page, limit: 35 })

  return (
    <>
      <Topbar icon={ImageIcon} title="Gallery" />
      <TagFilter selected={tag} />
      <div className="grow px-6 py-4">
        <Masonry images={result.data} columns={5} />
      </div>
      {"totalPage" in result ? <Pagination page={page} totalPage={result.totalPage} tag={tag} /> : null}
    </>
  )
}

export default Page
```

O `GalleryContextProvider` some junto com o `layout.tsx` que só existia para montá-lo. `page` e `tag` viram query string — link compartilhável e botão de voltar funcionando, que hoje não existem.

- [ ] **Step 3: Paginação como links**

```tsx
// src/components/gallery/pagination.tsx
import Link from "next/link"
import { cn } from "@/lib/cn"

interface PaginationProps {
  page: number
  totalPage: number
  tag?: string
}

export const Pagination = ({ page, totalPage, tag }: PaginationProps) => {
  const href = (n: number) => ({ pathname: "/gallery", query: { page: n, ...(tag ? { tag } : {}) } })
  const around = [page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= totalPage)

  return (
    <nav className="flex h-16 flex-none items-center justify-center gap-1 border-t border-line">
      {page > 1 ? (
        <Link href={href(page - 1)} className="flex h-11 items-center rounded-md px-3 text-sm text-ink-2 hover:bg-raise">
          Previous
        </Link>
      ) : null}
      {around.map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={cn(
            "flex h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm tabular-nums",
            n === page ? "bg-accent font-semibold text-rail" : "text-ink-2 hover:bg-raise"
          )}
        >
          {n}
        </Link>
      ))}
      <span className="px-2 font-mono text-xs text-ink-3">… {totalPage}</span>
      {page < totalPage ? (
        <Link href={href(page + 1)} className="flex h-11 items-center rounded-md px-3 text-sm text-ink-2 hover:bg-raise">
          Next
        </Link>
      ) : null}
    </nav>
  )
}
```

Duas decisões: o botão **"Last" sai** — saltar para o offset máximo é a consulta mais cara possível, para achar a imagem mais antiga do acervo; e os alvos são `h-11` (44px), porque o scorer reprova qualquer clicável menor que isso em 390px.

- [ ] **Step 4: Recent com cursor**

A primeira página vem do servidor; só as seguintes passam pela rota, com `useInfiniteQuery` do TanStack v5:

```tsx
// src/components/recent/feed.tsx
"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { Card } from "@/components/recent/card"
import type { FeedPage } from "@/types/image"

export const Feed = ({ initial }: { initial: FeedPage }) => {
  const sentinel = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["images", "recent"],
    initialPageParam: null as string | null,
    initialData: { pages: [initial], pageParams: [null] },
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`/api/images?limit=30${pageParam ? `&cursor=${pageParam}` : ""}`)
      return (await response.json()) as FeedPage
    },
    getNextPageParam: (last) => last.cursor,
  })

  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasNextPage || isFetchingNextPage) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        void fetchNextPage()
      }
    })

    observer.observe(node)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <div className="mx-auto flex max-w-[620px] flex-col gap-4">
      {data.pages.flatMap((page) => page.data).map((image) => (
        <Card key={image.id} image={image} />
      ))}
      {hasNextPage ? <div ref={sentinel} className="h-10" /> : null}
    </div>
  )
}
```

- [ ] **Step 5: Apagar o substituído**

```bash
rm src/contexts/useGallery.tsx \
   src/components/gallery/SideNavFilter.tsx src/components/gallery/SelectPageModal.tsx \
   src/components/recent/InfiniteFetch.tsx src/components/LoadingPage.tsx \
   "src/app/(app)/gallery/layout.tsx"
```

- [ ] **Step 6: Conferir à mão o que o score não pega**

Run: `npm run dev`

Abrir `/gallery?page=3`, copiar a URL, colar em aba nova — tem que cair na página 3. Voltar no navegador tem que funcionar. Nenhuma das duas coisas funciona hoje.

- [ ] **Step 7: Gate da onda**

Run: `npm run ui:score`

**Só siga para a Onda 3 quando o total for ≥ 98.** Abaixo disso, ler `tests/visual/score-report/report.json`, corrigir o que está listado e medir de novo. As causas mais comuns nesta altura: `data-probe` esquecido, altura de controle diferente da prancha (34 nav, 40 botão, 52 topbar), e alvo clicável abaixo de 44px em 390px.

- [ ] **Step 8: Commit** — invocar a skill `auto-commit`.

---

## Onda 3 — NSFW com enforcement

### Task 7: Gate por cookie e middleware

**Files:**
- Create: `src/middleware.ts`, `src/app/(redirect)/nsfw-validation/actions.ts`
- Modify: `src/app/(app)/nsfw/page.tsx`, `src/app/(redirect)/nsfw-validation/page.tsx`
- Delete: `src/contexts/useNSFW.tsx`, `src/components/nsfw/`, `src/app/(app)/nsfw/layout.tsx`
- Test: `src/middleware.test.ts`

**Interfaces:**
- Produces: cookie `age_ok` (httpOnly, secure, sameSite lax, 30 dias); middleware protegendo `/nsfw`

- [ ] **Step 1: Teste antes — aqui um erro tem consequência real**

```ts
// src/middleware.test.ts
import { NextRequest } from "next/server"
import { expect, test } from "vitest"
import { middleware } from "@/middleware"

const request = (path: string, cookie?: string) => {
  const next = new NextRequest(`https://alcremie.test${path}`)

  if (cookie) {
    next.cookies.set("age_ok", cookie)
  }

  return next
}

test("sem cookie, /nsfw redireciona para a validação", () => {
  const response = middleware(request("/nsfw"))

  expect(response.status).toBe(307)
  expect(response.headers.get("location")).toContain("/nsfw-validation")
})

test("cookie inválido não passa", () => {
  expect(middleware(request("/nsfw", "sim")).status).toBe(307)
})

test("com cookie válido, passa", () => {
  expect(middleware(request("/nsfw", "1")).status).toBe(200)
})

test("query string não contorna o gate", () => {
  expect(middleware(request("/nsfw?page=2")).status).toBe(307)
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/middleware.test.ts`
Expected: FAIL, "Cannot find module '@/middleware'".

- [ ] **Step 3: Implementar**

```ts
// src/middleware.ts
import { type NextRequest, NextResponse } from "next/server"

export const middleware = (request: NextRequest) => {
  if (request.cookies.get("age_ok")?.value === "1") {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = "/nsfw-validation"
  url.search = ""

  return NextResponse.redirect(url)
}

export const config = { matcher: ["/nsfw/:path*", "/nsfw"] }
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/middleware.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Gravar o cookie por Server Action**

```ts
// src/app/(redirect)/nsfw-validation/actions.ts
"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const confirmAge = async (formData: FormData) => {
  const store = await cookies()

  store.set("age_ok", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: formData.get("remember") === "on" ? 60 * 60 * 24 * 30 : undefined,
    path: "/",
  })

  redirect("/nsfw")
}
```

`httpOnly` e `secure` não são detalhe: são exatamente os dois atributos que o cookie de sessão da API antiga não tinha.

- [ ] **Step 6: A página como o modal da prancha**

O `<Link href="/nsfw">` vira `<form action={confirmAge}>` com submit e o checkbox `remember`. Zero JavaScript no cliente.

- [ ] **Step 7: Apagar a duplicata**

```bash
rm src/contexts/useNSFW.tsx "src/app/(app)/nsfw/layout.tsx"
rm -rf src/components/nsfw
```

`useNSFW.tsx` era `useGallery.tsx` copiado com `nsfw: true` trocado. A página NSFW reusa `<Masonry>`, `<TagFilter>` e `<Pagination>` da Onda 2, com a faixa âmbar da prancha por cima.

- [ ] **Step 8: Conferir o que o teste não pega**

Run: `npm run dev`

`/nsfw` em janela anônima cai na validação. Confirmar, voltar, tentar `/nsfw?page=2` — passa. Apagar o cookie no DevTools e recarregar — bloqueia de novo.

- [ ] **Step 9: Gate da onda**

Run: `npm run ui:score`
**Só siga quando o total for ≥ 98.**

- [ ] **Step 10: Commit** — invocar a skill `auto-commit`.

---

## Onda 4 — Upload

### Task 8: Autenticação

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `src/middleware.ts`, `src/components/shell/sidebar.tsx`, `.env.example`

- [ ] **Step 1: Instalar**

```bash
npm i next-auth@5.0.0-beta.32 @auth/drizzle-adapter@1.11.3
```

```ts
// src/lib/auth.ts
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db } from "@/db/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.sub as string, role: token.role as string },
    }),
  },
})
```

Estratégia JWT: nenhuma tabela de sessão, como decidido no §08 do documento do banco.

- [ ] **Step 2: Fechar o upload**

No `src/middleware.ts`, antes do bloco do NSFW, e com `"/upload/:path*"` no matcher:

```ts
if (request.nextUrl.pathname.startsWith("/upload")) {
  const session = await auth()

  if (session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}
```

Isso fecha o buraco crítico do §09: hoje `POST /api/upload` não tem guard nenhum.

- [ ] **Step 3: Conferir**

Run: `npm run dev`
Expected: `/upload` em janela anônima redireciona para `/`. Logado com conta não-admin, também.

- [ ] **Step 4: Commit** — invocar a skill `auto-commit`.

---

### Task 9: A tela de upload da prancha

**Files:**
- Create: `src/app/(app)/upload/actions.ts`, `src/components/upload/dropzone.tsx`, `src/components/upload/queue.tsx`, `src/components/upload/queue-row.tsx`, `src/hooks/upload/use-upload-queue.ts`
- Modify: `src/app/(app)/upload/page.tsx`
- Delete: `src/contexts/useUpload.tsx`, `src/components/upload/{FilesView,PreviewCard,Send,UploadArea}.tsx`, `src/app/(app)/upload/layout.tsx`

**Interfaces:**
- Consumes: `tagImage`, `ratingOf` (banco, Task 5); `createImageWithTags` (banco, Task 3); `auth()` (Task 8)
- Produces: `uploadOne(formData) → ActionResult<{ id, rating, tags }>` — **um arquivo por chamada**

- [ ] **Step 1: Server Action de um arquivo**

```ts
// src/app/(app)/upload/actions.ts
"use server"

import { createHash } from "node:crypto"
import { v2 as cloudinary } from "cloudinary"
import sharp from "sharp"
import { createImageWithTags } from "@/services/images"
import { ratingOf, tagImage } from "@/services/tagger"
import { auth } from "@/lib/auth"

const MAX_BYTES = 8 * 1024 * 1024

export const uploadOne = async (formData: FormData) => {
  const session = await auth()

  if (session?.user?.role !== "admin") {
    return { ok: false as const, error: "not allowed" }
  }

  const file = formData.get("file")

  if (!(file instanceof File)) {
    return { ok: false as const, error: "no file" }
  }

  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: "file too large" }
  }

  const original = Buffer.from(await file.arrayBuffer())

  const [detected, rating, webp] = await Promise.all([
    tagImage(original),
    ratingOf(original),
    sharp(original).webp({ quality: 90 }).toBuffer(),
  ])

  const meta = await sharp(webp).metadata()

  const uploaded = await new Promise<{ public_id: string; version: number }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "alcremie" }, (error, result) => (result ? resolve(result) : reject(error)))
      .end(webp)
  })

  const id = await createImageWithTags(
    {
      contentHash: createHash("sha256").update(webp).digest("hex"),
      cloudinaryId: uploaded.public_id,
      cloudinaryVersion: uploaded.version,
      width: meta.width as number,
      height: meta.height as number,
      bytes: webp.byteLength,
      format: "webp",
      rating,
    },
    detected
  )

  if (!id) {
    return { ok: false as const, error: "duplicate" }
  }

  return { ok: true as const, data: { id, rating, tags: detected.slice(0, 8).map((tag) => tag.name) } }
}
```

Pasta `alcremie`, não `alcremie-bucket`: separa o acervo novo do legado, já que não houve migração.

Três mudanças sobre o `POST /api/upload` de hoje: um arquivo por chamada (o cliente controla a concorrência e um erro não derruba o lote), limite de tamanho, e as tags voltam para a tela.

- [ ] **Step 2: Dropzone com a biblioteca da casa**

```bash
npm i react-dropzone@20.1.1
```

- [ ] **Step 3: A fila com estado por arquivo**

```ts
// src/hooks/upload/use-upload-queue.ts — o núcleo
const send = async () => {
  let done = 0
  let failed = 0

  for (const item of items) {
    setItems((previous) => previous.map((row) => (row.id === item.id ? { ...row, state: "running" } : row)))

    const formData = new FormData()
    formData.append("file", item.file)
    const result = await uploadOne(formData)

    if (result.ok) {
      done++
    } else {
      failed++
    }

    setItems((previous) =>
      previous.map((row) =>
        row.id === item.id
          ? result.ok
            ? { ...row, state: "done", tags: result.data.tags, rating: result.data.rating }
            : { ...row, state: "error", message: result.error }
          : row
      )
    )
  }

  if (failed > 0) {
    toastError(`${done} enviadas, ${failed} falharam`)
    return
  }

  toastSuccess(`${done} imagens publicadas`)
}
```

Serial de propósito: cada arquivo carrega o modelo ONNX no servidor e paralelizar multiplicaria a memória.

Isso liga o feedback que existe comentado em `useUpload.tsx` desde sempre — um `toast.promise` inteiro dentro de um bloco de comentário, com o `api.post` sem `try/catch`.

- [ ] **Step 4: Apagar o contexto**

```bash
rm src/contexts/useUpload.tsx "src/app/(app)/upload/layout.tsx"
rm src/components/upload/{FilesView,PreviewCard,Send,UploadArea}.tsx
```

- [ ] **Step 5: Conferir com um arquivo grande**

Run: `npm run dev`

Subir 3 imagens, uma com mais de 8 MB. Expected: as duas menores completam com as tags aparecendo na linha; a grande falha com "file too large" **sem** derrubar as outras. Hoje uma falha derruba o lote inteiro.

- [ ] **Step 6: Gate da onda**

Run: `npm run ui:score`
**Só siga quando o total for ≥ 98.**

- [ ] **Step 7: Commit** — invocar a skill `auto-commit`.

---

## Onda 5 — Limpeza e o gate final

### Task 10: Remover o que o redesenho tornou desnecessário

**Files:**
- Modify: `package.json`, `src/components/shell/topbar.tsx`
- Create: `src/components/shell/mobile-nav.tsx`
- Delete: `src/lib/axios.ts`, `src/utils/hero-home-images.ts`

- [ ] **Step 1: Remover**

```bash
npm rm react-layout-masonry react-modern-drawer prop-types dayjs @headlessui/react @headlessui/tailwindcss
npm i date-fns@4.4.0 class-variance-authority@0.7.1
```

| Sai | Entra |
| --- | --- |
| `react-query` v3 + `axios` | Server Components + TanStack Query v5 (Onda 2) |
| `react-layout-masonry` | `<Masonry>`, grid de colunas flex |
| `react-modern-drawer` | shell fixo; mobile com `<dialog>` nativo |
| `react-toastify` | `sonner` (Onda 2) |
| `react-countup` | números estáticos (Onda 2) |
| `dayjs` | `date-fns`, o da casa |
| `prop-types` | é um projeto TypeScript |
| `@headlessui/*` | o combobox de tag vira `<input>` + lista, com `use-tag-search` |

Ficam `react-photo-view` (o lightbox continua sendo feature), `clsx`, `tailwind-merge`, `sharp` (exigido pelo otimizador do Next em self-host).

- [ ] **Step 2: Drawer mobile com `<dialog>`**

Abaixo de 1024px a sidebar está escondida desde a Task 3. Um botão no topbar abre um `<dialog>` nativo com os mesmos `NAV_ITEMS` — sem biblioteca, com Esc e backdrop de graça. O botão precisa ter 44px: o scorer reprova menos que isso em 390px.

- [ ] **Step 3: Apagar as 102 URLs hardcoded**

```bash
rm src/utils/hero-home-images.ts src/lib/axios.ts
```

Eram 102 URLs `http://` fixas no código alimentando o hero. O hero novo usa `fetchImageFeed({ nsfw: false, limit: 14 })` no servidor.

- [ ] **Step 4: Medir o bundle**

```bash
npm run build
```

Comparar o "First Load JS" com o da branch `feature/next-13-old-style`. A queda deve vir principalmente de `/gallery` e `/recent`.

- [ ] **Step 5: Commit** — invocar a skill `auto-commit`.

---

### Task 11: O gate final

**Files:** nenhum novo — esta task é o laço de convergência.

- [ ] **Step 1: Rodar completo**

```bash
npm run lint
npm run tc
npx vitest run
npm run ui:score
```

- [ ] **Step 2: Laço até 98**

Enquanto `npm run ui:score` sair abaixo de **98**:

1. Abrir `tests/visual/score-report/report.json` e olhar a página de menor nota.
2. Atacar na ordem em que dão mais ponto: `missingProbes` (cada probe ausente custa 3 medidas de estrutura), depois `problems` de responsividade (2 pontos cada), depois as diferenças de estrutura.
3. Corrigir **uma** categoria, rodar `npm run ui:score:one <página>`, confirmar que subiu.
4. Repetir.

Não relaxar o gate, não editar os pesos, não mexer nas pranchas de referência para aproximá-las da implementação — a prancha é a especificação.

- [ ] **Step 3: Registrar a nota final**

Colar a tabela do `ui:score` na mensagem do commit final.

- [ ] **Step 4: Commit** — invocar a skill `auto-commit`.

---

## Self-Review

**Cobertura do spec:** as sete pranchas viram tasks — Home (Task 5), Gallery e Recent (Task 6), NSFW e validation (Task 7), Upload (Task 9), a folha do sistema visual vira os tokens (Task 2), e o shell é a Task 3. O score da Task 4 mede as seis páginas contra as pranchas.

**Convenções do eleva-management aplicadas:** Biome + Prettier + husky + lint-staged (Task 1), estrutura plural com `(app)`/`(redirect)` e `services/` (Tasks 1 e 3), arquivos kebab-case e named exports (todas), `queryClient` em `components/provider` e wrappers de toast em `lib/toast` (Task 6), lucide-react (Task 3), TanStack Query v5 (Task 6), react-dropzone (Task 9), date-fns (Task 10).

**Defeitos do §09 fechados aqui:** upload sem auth (Task 8), gate NSFW que é só um link (Task 7), cookie sem httpOnly/secure (Tasks 7 e 8), `unoptimized: true` e `hostname: "**"` (Task 1), `key` no elemento errado e `priority` em 35 imagens (Task 5), `useGallery`/`useNSFW` duplicados (Tasks 6 e 7), toast comentado e upload sem try/catch (Task 9), `Header.tsx` vazio (Task 3), URLs `http://` (Task 5, via `cloudinaryUrl`).

**Fora do escopo:** `GET /api/favorite/:id` que muta estado — morre no plano do banco, quando `toggleFavorite` vira POST/DELETE.

**Dependência entre os planos:** Ondas 1 e 5 daqui são independentes do banco. Ondas 2, 3 e 4 exigem as Tasks 2, 3 e 4 do plano do banco. A **Task 1 daqui vem antes de tudo** — é ela que cria a estrutura de pastas e o Biome que o plano do banco assume.
