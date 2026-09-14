# Convenções e stack — base compartilhada dos dois planos

> Este documento não é executável sozinho. Ele é a seção **Global Constraints** dos planos
> `2026-09-13-banco-postgres-drizzle.md` e `2026-09-13-ui-rebrand.md`, extraída para não divergir entre os dois.

**Origem:** as convenções abaixo foram lidas de `m4all/eleva-management/eleva-management-ui` em 2026-09-13. O que é específico do m4all (`@media4all/eleva-system`, `@media4all/session-lite`, Radix/shadcn em `components/ui`) **não** entra no Alcremie — o rebrand tem identidade própria. O que entra é organização, ferramenta e padrão de código.

---

## 1. Versões

Fixadas em 2026-09-13. Instalar exatamente estas — não `latest` num `npm i` futuro sem revisar.

| Pacote | Versão | Observação |
| --- | --- | --- |
| `next` | `16.3.5` | eleva-management está em `^16.3.0` |
| `react` / `react-dom` | `19.3.0` | |
| `typescript` | `5.9.3` | **não** o 7.0. O compilador nativo é novo demais para o plugin do Next e para o Biome |
| `tailwindcss` | `3.4.19` | **não** o 4.3. A v4 muda o formato da config inteiro, e `prettier-plugin-tailwindcss`, `tailwindcss-animate` e `tailwind-scrollbar` da casa são todos v3 |
| `@biomejs/biome` | `2.5.13` | lint + format de JS/TS |
| `prettier` | `3.9.6` | só CSS e ordenação de classe Tailwind |
| `prettier-plugin-tailwindcss` | `0.6.5` | |
| `husky` | `9.1.7` | |
| `lint-staged` | `17.5.1` | |
| `@types/node` | `24.13.4` | casa com o Node 24 da máquina |
| `@tanstack/react-query` | `5.102.8` | o repo hoje usa `react-query` **v3**, que é outro pacote |
| `sonner` | `2.0.8` | substitui `react-toastify` |
| `lucide-react` | `1.45.0` | já é dependência do Alcremie |
| `clsx` | `2.1.1` | |
| `tailwind-merge` | `3.7.0` | |
| `class-variance-authority` | `0.7.1` | variantes de componente |
| `date-fns` | `4.4.0` | substitui `dayjs` |
| `react-dropzone` | `20.1.1` | a área de upload |
| `zod` | `4.6.5` | **diverge da casa** (3.23). É projeto novo, não há migração a pagar |
| `drizzle-orm` | `0.45.2` | |
| `drizzle-kit` | `0.31.10` | |
| `postgres` | `3.4.9` | driver postgres.js |
| `next-auth` | `5.0.0-beta.32` | v5; a `latest` (4.24) é a geração anterior |
| `@auth/drizzle-adapter` | `1.11.3` | |
| `onnxruntime-node` | `1.29.0` | |
| `sharp` | `0.35.4` | |
| `vitest` | `5.0.0` | |

**Três divergências deliberadas da casa**, com o motivo:

- **Tailwind fica na v3** mesmo com a v4 disponível. A casa é v3 e o conjunto de plugins da casa é v3. Consistência ganha.
- **TypeScript fica no 5.9** mesmo com o 7.0 disponível. O 7 é a reescrita nativa em Go; o ecossistema Next/Biome ainda está alcançando.
- **Zod vai para a v4** mesmo com a casa na v3. Não há forms complexos no Alcremie — `react-hook-form` e `@hookform/resolvers` não entram —, então a incompatibilidade que trava a casa na v3 não existe aqui.

---

## 2. Estrutura de pastas

Espelha `eleva-management-ui/src`. As três pastas no **singular** que o Alcremie usa hoje (`component/`, `util/`, `@Types/`) viram plural.

```
src/
  app/
    (app)/              rotas com o shell — home, gallery, recent, nsfw, upload
    (redirect)/         rotas sem shell — nsfw/validation
    api/                route handlers
  assets/
    fonts/  logos/  svgs/
  components/
    <feature>/          kebab-case: home/, gallery/, recent/, upload/, shell/
    ui/                 primitivas reusáveis (fora do lint, como na casa)
  constant/
  contexts/
  db/                   schema.ts, client.ts — infra do Drizzle
  hooks/
    <feature>/          use-*.ts
  lib/
    toast/              toast-error.ts, toast-success.ts
  services/
    <feature>.ts        acesso a dados: images.ts, tags.ts, stats.ts
  styles/
  types/
  utils/
```

`services/` na casa fala com uma API Spring remota. No Alcremie ele fala com o Postgres local — mesmo papel, mesma camada: **nenhum componente importa de `@/db` direto**, sempre de `@/services`.

### Renomeações do repositório atual

| Hoje | Vira |
| --- | --- |
| `src/component/` | `src/components/` |
| `src/util/` | `src/utils/` |
| `src/@Types/` | `src/types/` |
| `src/context/` | `src/contexts/` |
| `src/hook/` | `src/hooks/` |
| `src/lib/axios.ts` | `src/services/api.ts` |
| `src/component/home/status/Index.ts.tsx` | apagado (o nome já denuncia) |

---

## 3. Nomes

| Coisa | Padrão | Exemplo |
| --- | --- | --- |
| Arquivo | kebab-case | `use-gallery.ts`, `toast-error.ts`, `tag-filter.tsx` |
| Componente | PascalCase, **named export** | `export const TagFilter = () => …` |
| Hook | `use-<coisa>.ts`, named export | `export const useGallery = () => …` |
| Service | verbo + substantivo | `fetchImagePage`, `searchTags` |
| Rota do App Router | `page.tsx`, `layout.tsx`, `route.ts` — **default export** onde o Next exige | |
| Query key | array com prefixo do recurso | `["images", page, tag]` |

Toda função é **arrow function**. Nada de `function foo() {}` fora do que o Next exige.

---

## 4. Lint e formatação

Biome cuida de JS/TS. Prettier cuida de CSS e da ordenação de classe Tailwind. Os dois rodam no commit por lint-staged.

### `biome.json`

Copiar de `eleva-management-ui/biome.json`, trocando só o schema para `2.5.13` e o `includes` (o Alcremie não tem `scripts/` a ignorar — tem, e deve ignorar `models/`).

O que esse config impõe e o código atual do Alcremie viola:

| Regra | Estado hoje |
| --- | --- |
| `semicolons: "asNeeded"` | tudo com ponto e vírgula |
| `quoteStyle: "double"` | tudo com aspas simples |
| `lineWidth: 120` | 100 |
| `useBlockStatements: error` | há `if` sem chave |
| `noConsole: warn` | `console.log(error)` em `cloudinary.service.ts:38` |
| `noExplicitAny: warn` | `signIn(req: any)` |
| `useSelfClosingElements: warn` | `<div className="pt-14"></div>` |
| `organizeImports: on` | imports fora de ordem em quase todo arquivo |

### `.prettierrc`

```json
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": false,
  "printWidth": 120,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Scripts

```json
"lint": "biome check ./src",
"tc": "tsc --noEmit",
"biome:fix": "biome check --write ./src",
"biome:format": "biome format --write ./src",
"prepare": "husky"
```

### `lint-staged`

```json
"*.{ts,tsx,js,jsx}": [
  "biome check --write --no-errors-on-unmatched",
  "prettier --write --plugin prettier-plugin-tailwindcss"
],
"*.json": ["biome format --write --no-errors-on-unmatched"],
"*.css": ["prettier --write"]
```

`.husky/pre-commit` tem uma linha: `npx lint-staged`.

---

## 5. `tsconfig.json`

Copiar o da casa. O que importa: `strict: true`, `moduleResolution: "bundler"`, `target: "ES2017"`, `paths: { "@/*": ["./src/*"] }`. O Alcremie já usa `@/`, então nada quebra.

---

## 6. Padrões de código da casa

**Server Action + `unwrap`.** Ações ficam em `app/(app)/<feature>/actions.ts` e devolvem um `ActionResult`; o cliente chama `unwrap(await acaoQualquer())`. Copiar `services/action-result.ts` da casa.

**Toast por wrapper, nunca direto.** `lib/toast/toast-error.ts` e `toast-success.ts` envolvem o `sonner`. Componente nunca importa `sonner`.

**Query client único.** Exportado de `components/provider.tsx`, como na casa — hooks importam de lá para invalidar.

**Ícone é `lucide-react`.** Isso **substitui os SVG inline** que estavam nas pranchas do canvas: as pranchas são desenho, o código usa a biblioteca que já é dependência do projeto. Os nomes usados: `House`, `GalleryVertical`, `Image`, `OctagonAlert`, `Upload`, `Tag`, `Server`, `Search`, `Shield`, `Trash2`, `Plus`, `Heart`, `RefreshCcw`, `Check`, `X`.

---

## 7. Dados: começar do zero

**Não há migração de dados.** Nem do MySQL, nem reingestão do bucket do Cloudinary. O Postgres novo sobe vazio e enche pelo fluxo real de upload.

Consequências:

- `alcremie-db/migrate-from-mysql.ts` não é usado. Fica no diretório como referência morta.
- O bucket `alcremie-bucket` no Cloudinary vira legado. As imagens novas vão para `alcremie/` (pasta nova), o que deixa óbvio o que é de qual era.
- Para ter o que olhar durante o desenvolvimento existe um **seed local** (Onda 1, Tarefa 3 do plano do banco): 12 imagens de uma pasta local passando pelo tagger. É `NODE_ENV !== 'production'` e nunca roda em produção.
- `users` e `favorites` nascem vazias, o que já era o caso.

---

## 8. Ordem de leitura

1. Este documento.
2. `2026-09-13-banco-postgres-drizzle.md` — Trilha A.
3. `2026-09-13-ui-rebrand.md` — Trilha B.

Os dois repetem o essencial daqui nas próprias seções de Global Constraints. Se algo divergir, **este documento vence**.
