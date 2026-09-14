#!/usr/bin/env node
/**
 * Pontua a implementação da UI contra as pranchas do rebrand, de 0 a 100.
 *
 *   node score-ui.mjs                       # tudo, contra http://localhost:3000
 *   node score-ui.mjs --base http://…       # outro host
 *   node score-ui.mjs --only gallery        # uma página
 *   node score-ui.mjs --gate 98             # limite (padrão 98)
 *
 * Sai com código 1 se o total ficar abaixo do gate.
 *
 * Composição:
 *   40  estrutura      geometria dos elementos com data-probe, contra a prancha
 *   20  cor            tokens pintados nos mesmos pontos
 *   15  tipografia     família, tamanho e peso nos mesmos pontos
 *   25  responsividade checagens duras em 4 viewports (só a implementação)
 *
 * O diff de pixel é gerado como artefato para olho humano, mas NÃO entra na
 * nota: a prancha usa imagens de exemplo e a implementação usa o acervo real,
 * então um diff perceptual nunca chegaria a 98 por motivo legítimo.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, 'score-report')

const PAGES = [
  { name: 'home', route: '/', reference: 'ref-Main.html' },
  { name: 'gallery', route: '/gallery', reference: 'ref-Gallery.html' },
  { name: 'recent', route: '/recent', reference: 'ref-Recent.html' },
  { name: 'nsfw', route: '/nsfw', reference: 'ref-Nsfw.html' },
  // O gate de idade vive no grupo (redirect), fora do shell: a prancha desenha o
  // shell atrás do modal, a implementação não tem. Ignoramos os probes do shell.
  {
    name: 'age-gate',
    route: '/nsfw-validation',
    reference: 'ref-AgeGate.html',
    ignoreProbes: ['rail', 'sidebar', 'topbar', 'content', 'masonry', 'nav-active'],
  },
  { name: 'upload', route: '/upload', reference: 'ref-Upload.html' },
]

/**
 * A prancha tem altura fixa de frame; a página real cresce com o conteúdo.
 * Para os contêineres de altura total, comparar `h` puniria a implementação por
 * um motivo sem sentido — e tornaria o gate de 98 inalcançável. Comparamos só
 * largura e posição x nesses.
 *
 * `masonry` entra pelo mesmo motivo: a altura da grade é função da quantidade
 * de linhas (quantas imagens o banco tem), não de fidelidade de design — a
 * prancha desenha 19 imagens, o dev local pode ter só um punhado. Só largura
 * e posição x são significativas aqui também.
 */
const HEIGHT_EXEMPT = new Set(['rail', 'sidebar', 'content', 'masonry'])

const REFERENCE_DIR = path.join(HERE, 'reference')

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
]

const WEIGHTS = { structure: 40, color: 20, type: 15, responsive: 25 }

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}

const BASE = flag('base', 'http://localhost:3000')
const GATE = Number(flag('gate', 98))
const ONLY = flag('only', null)

// --------------------------------------------------------------- coleta

const collect = () => {
  const probes = {}

  for (const node of document.querySelectorAll('[data-probe]')) {
    const key = node.getAttribute('data-probe')
    if (probes[key]) {
      continue
    }

    const rect = node.getBoundingClientRect()
    const style = getComputedStyle(node)

    probes[key] = {
      w: Math.round(rect.width),
      h: Math.round(rect.height),
      x: Math.round(rect.x),
      background: style.backgroundColor,
      color: style.color,
      borderColor: style.borderTopColor,
      radius: style.borderTopLeftRadius,
      fontFamily: style.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacing,
      gap: style.gap,
    }
  }

  return probes
}

const audit = () => {
  const problems = []
  const doc = document.documentElement

  if (doc.scrollWidth > doc.clientWidth + 1) {
    problems.push({ rule: 'overflow-x', detail: `${doc.scrollWidth} > ${doc.clientWidth}` })
  }

  const visible = [...document.querySelectorAll('body *')].filter((node) => {
    const rect = node.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 && getComputedStyle(node).visibility !== 'hidden'
  })

  const hasOwnText = (node) => [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim())

  for (const node of visible) {
    const rect = node.getBoundingClientRect()

    if (rect.width > doc.clientWidth + 1) {
      const overflows = getComputedStyle(node.parentElement ?? node).overflowX
      if (overflows !== 'auto' && overflows !== 'scroll') {
        problems.push({ rule: 'wider-than-viewport', detail: describe(node), value: Math.round(rect.width) })
      }
    }

    if (hasOwnText(node)) {
      // 12px é o piso para texto de leitura corrida a distância de braço
      // (telas estreitas, ≤480px). Acima disso, rótulos curtos em maiúsculas
      // (labels de seção, chips, status) em telas largas são uma convenção
      // de interface legítima e a prancha os desenha a 10-11px — o piso ali
      // é 10px, não 12.
      const size = Number.parseFloat(getComputedStyle(node).fontSize)
      const floor = doc.clientWidth <= 480 ? 12 : 10
      if (size < floor) {
        problems.push({ rule: 'font-too-small', detail: describe(node), value: size })
      }

      if (node.scrollWidth > node.clientWidth + 1 && getComputedStyle(node).overflow === 'hidden') {
        problems.push({ rule: 'text-clipped', detail: describe(node) })
      }
    }
  }

  if (doc.clientWidth <= 480) {
    for (const node of document.querySelectorAll('a, button, [role="button"], input, select')) {
      const rect = node.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        continue
      }
      if (Math.min(rect.width, rect.height) < 44) {
        problems.push({ rule: 'hit-target', detail: describe(node), value: Math.round(Math.min(rect.width, rect.height)) })
      }
    }
  }

  // A regra é sobre texto encostado na borda, não sobre contêineres cujos
  // descendentes têm texto — um rail de ícones ou o wrapper do shell tocando
  // x=0 é layout de propósito, não um problema de gutter. Por isso usa o
  // mesmo `hasOwnText` do loop acima, não `node.textContent`.
  const gutter = getComputedStyle(document.body)
  if (Number.parseFloat(gutter.paddingLeft) === 0 && doc.clientWidth <= 480) {
    const touching = visible.some((node) => node.getBoundingClientRect().left === 0 && hasOwnText(node))
    if (touching) {
      problems.push({ rule: 'no-side-gutter', detail: 'texto encostado na borda em 390px' })
    }
  }

  return problems

  function describe(node) {
    const cls = typeof node.className === 'string' ? node.className.split(' ').slice(0, 2).join('.') : ''
    return `${node.tagName.toLowerCase()}${cls ? '.' + cls : ''}`
  }
}

// --------------------------------------------------------------- notas

/** 1.0 se igual, caindo linearmente até 0 numa diferença de `span` px. */
const nearness = (a, b, span) => Math.max(0, 1 - Math.abs(a - b) / span)

const rgb = (value) => (value.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number)

const colorNearness = (a, b) => {
  if (a === b) {
    return 1
  }

  const [ar, ag, ab] = rgb(a)
  const [br, bg, bb] = rgb(b)

  if ([ar, ag, ab, br, bg, bb].some((n) => n === undefined)) {
    return 0
  }

  const distance = Math.hypot(ar - br, ag - bg, ab - bb)
  return Math.max(0, 1 - distance / 40)
}

const scoreStructure = (reference, implementation, ignore = []) => {
  const wanted = Object.keys(reference).filter((key) => !ignore.includes(key))
  const keys = wanted.filter((key) => implementation[key])
  const missing = wanted.filter((key) => !implementation[key])

  const scores = keys.flatMap((key) => {
    const pair = [
      nearness(reference[key].w, implementation[key].w, 8),
      nearness(reference[key].x, implementation[key].x, 8),
    ]

    if (!HEIGHT_EXEMPT.has(key)) {
      pair.push(nearness(reference[key].h, implementation[key].h, 8))
    }

    return pair
  })

  // Probe ausente na implementação conta zero — não some da conta.
  const total = scores.reduce((sum, n) => sum + n, 0)
  const count = scores.length + missing.length * 3

  return { ratio: count ? total / count : 0, missing }
}

const scoreColor = (reference, implementation, ignore = []) => {
  const keys = Object.keys(reference).filter((key) => implementation[key] && !ignore.includes(key))

  const scores = keys.flatMap((key) => [
    colorNearness(reference[key].background, implementation[key].background),
    colorNearness(reference[key].color, implementation[key].color),
    colorNearness(reference[key].borderColor, implementation[key].borderColor),
  ])

  return scores.length ? scores.reduce((sum, n) => sum + n, 0) / scores.length : 0
}

const scoreType = (reference, implementation, ignore = []) => {
  const keys = Object.keys(reference).filter((key) => implementation[key] && !ignore.includes(key))

  const scores = keys.flatMap((key) => [
    reference[key].fontFamily === implementation[key].fontFamily ? 1 : 0,
    nearness(Number.parseFloat(reference[key].fontSize), Number.parseFloat(implementation[key].fontSize), 3),
    reference[key].fontWeight === implementation[key].fontWeight ? 1 : 0,
  ])

  return scores.length ? scores.reduce((sum, n) => sum + n, 0) / scores.length : 0
}

// --------------------------------------------------------------- execução

const run = async () => {
  mkdirSync(OUT, { recursive: true })

  const browser = await chromium.launch()
  const pages = ONLY ? PAGES.filter((page) => page.name === ONLY) : PAGES
  const report = []

  for (const target of pages) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const tab = await context.newPage()

    await tab.goto(`file://${path.join(REFERENCE_DIR, target.reference)}`, { waitUntil: 'networkidle' })
    const reference = await tab.evaluate(collect)

    const response = await tab.goto(`${BASE}${target.route}`, { waitUntil: 'networkidle' })

    // Rota ainda não implementada (ou quebrada) pontua zero em vez de derrubar a
    // medição inteira — a linha de base precisa ser mensurável desde o começo.
    if (!response || response.status() >= 400) {
      report.push({
        page: target.name,
        score: 0,
        structure: 0,
        color: 0,
        type: 0,
        responsive: 0,
        httpStatus: response ? response.status() : 'no response',
        missingProbes: Object.keys(reference),
        problems: [],
      })

      await context.close()
      continue
    }

    const implementation = await tab.evaluate(collect)
    await tab.screenshot({ path: path.join(OUT, `${target.name}-desktop.png`), fullPage: true })

    const ignore = target.ignoreProbes ?? []
    const structure = scoreStructure(reference, implementation, ignore)
    const color = scoreColor(reference, implementation, ignore)
    const type = scoreType(reference, implementation, ignore)

    const problems = []
    for (const viewport of VIEWPORTS) {
      await tab.setViewportSize({ width: viewport.width, height: viewport.height })
      await tab.waitForTimeout(150)

      const found = await tab.evaluate(audit)
      problems.push(...found.map((problem) => ({ ...problem, viewport: viewport.name })))

      if (viewport.name === 'mobile') {
        await tab.screenshot({ path: path.join(OUT, `${target.name}-mobile.png`), fullPage: true })
      }
    }

    // Cada problema custa 2 pontos dos 25; 13 problemas zeram a categoria.
    const responsive = Math.max(0, 1 - problems.length / 12.5)

    const score =
      structure.ratio * WEIGHTS.structure +
      color * WEIGHTS.color +
      type * WEIGHTS.type +
      responsive * WEIGHTS.responsive

    report.push({
      page: target.name,
      score: Number(score.toFixed(1)),
      httpStatus: response.status(),
      structure: Number((structure.ratio * WEIGHTS.structure).toFixed(1)),
      color: Number((color * WEIGHTS.color).toFixed(1)),
      type: Number((type * WEIGHTS.type).toFixed(1)),
      responsive: Number((responsive * WEIGHTS.responsive).toFixed(1)),
      missingProbes: structure.missing,
      problems,
    })

    await context.close()
  }

  await browser.close()

  const total = report.reduce((sum, row) => sum + row.score, 0) / report.length

  writeFileSync(
    path.join(OUT, 'report.json'),
    JSON.stringify({ total: Number(total.toFixed(1)), gate: GATE, pages: report }, null, 2),
  )

  console.table(
    report.map((row) => ({
      página: row.page,
      total: row.score,
      estrutura: `${row.structure}/40`,
      cor: `${row.color}/20`,
      tipo: `${row.type}/15`,
      responsivo: `${row.responsive}/25`,
    })),
  )

  for (const row of report) {
    if (row.httpStatus !== 200) {
      console.log(`\n${row.page}: rota respondeu ${row.httpStatus} — página conta zero`)
      continue
    }
    if (row.missingProbes.length) {
      console.log(`\n${row.page}: data-probe faltando → ${row.missingProbes.join(', ')}`)
    }
    for (const problem of row.problems.slice(0, 8)) {
      console.log(`${row.page} [${problem.viewport}] ${problem.rule}: ${problem.detail} ${problem.value ?? ''}`)
    }
    if (row.problems.length > 8) {
      console.log(`${row.page}: +${row.problems.length - 8} problemas em score-report/report.json`)
    }
  }

  console.log(`\nTOTAL ${total.toFixed(1)} / 100 — gate ${GATE}`)

  if (total < GATE) {
    console.log('ABAIXO DO GATE. Continue implementando.')
    process.exit(1)
  }

  console.log('Gate atingido.')
}

run()
