const {readFileSync} = jest.requireActual<{
  readFileSync: (path: string, encoding: 'utf8') => string
}>('fs')
const {dirname, join} = jest.requireActual<{
  dirname: (path: string) => string
  join: (...parts: string[]) => string
}>('path')

const css = readFileSync(join(dirname(expect.getState().testPath!), '..', 'global.css'), 'utf8')

const blockAfter = (marker: string) => {
  const start = css.indexOf(marker)
  if (start === -1) throw new Error(`missing block: ${marker}`)
  const open = css.indexOf('{', start)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') {
      depth--
      if (depth === 0) return css.slice(open + 1, i)
    }
  }
  throw new Error(`unterminated block: ${marker}`)
}

const declarationsIn = (block: string) => {
  const out: Record<string, string> = {}
  const uncommented = block.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const match of uncommented.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[match[1]!] = match[2]!.trim()
  }
  return out
}

const themeLayer = declarationsIn(blockAfter('@theme static'))
const darkLayer = declarationsIn(blockAfter('\n.theme-dark {'))
const islandLayer = declarationsIn(blockAfter('\n.light-island {'))

const resolve = (name: string, layers: Record<string, string>[]): string => {
  for (const layer of layers) {
    const raw = layer[name]
    if (raw === undefined) continue
    const reference = raw.match(/^var\((--[\w-]+)\)$/)
    return reference ? resolve(reference[1]!, layers) : raw
  }
  throw new Error(`unresolved token: ${name}`)
}

const channel = (value: number) =>
  value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4

const luminance = (hex: string) => {
  const digits = hex.trim().replace('#', '')
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((character) => character + character)
          .join('')
      : digits
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`not a hex colour: ${hex}`)
  const [red, green, blue] = [0, 2, 4].map(
    (offset) => Number.parseInt(full.slice(offset, offset + 2), 16) / 255
  ) as [number, number, number]
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

const contrast = (a: string, b: string) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort(
    (first, second) => second - first
  ) as [number, number]
  return (lighter + 0.05) / (darker + 0.05)
}

const AA_TEXT = 4.5
const UI_FLOOR = 3

const READING_SURFACES = [
  '--color-surface-card',
  '--color-surface-app',
  '--color-surface-raised',
  '--color-surface-input',
  '--color-surface-sidebar'
]
const WELL_SURFACES = ['--color-surface-well']
const NAV_SURFACES = ['--color-surface-app', '--color-surface-sidebar']
const NAV_WELL_SURFACES = ['--color-surface-nav-active']

const ratioOn = (fg: string, surface: string, layers: Record<string, string>[]) =>
  contrast(resolve(fg, layers), resolve(surface, layers))

const ratioBetween = (tokenA: string, tokenB: string, layers: Record<string, string>[]) =>
  contrast(resolve(tokenA, layers), resolve(tokenB, layers))

describe('light theme contrast', () => {
  const layers = [themeLayer]

  it.each(READING_SURFACES)('fg-primary clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-primary', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each([...READING_SURFACES, ...WELL_SURFACES])('fg-secondary clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-secondary', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each(READING_SURFACES)('fg-muted clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-muted', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each(WELL_SURFACES)('fg-muted clears the UI floor on %s', (surface) => {
    expect(ratioOn('--color-fg-muted', surface, layers)).toBeGreaterThanOrEqual(UI_FLOOR)
  })

  it.each(NAV_SURFACES)('fg-nav-muted clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-nav-muted', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each(NAV_WELL_SURFACES)('fg-nav-muted clears the UI floor on %s', (surface) => {
    expect(ratioOn('--color-fg-nav-muted', surface, layers)).toBeGreaterThanOrEqual(UI_FLOOR)
  })

  it('keeps primary darker than secondary darker than muted', () => {
    const onCard = (fg: string) => ratioOn(fg, '--color-surface-card', layers)
    expect(onCard('--color-fg-primary')).toBeGreaterThan(onCard('--color-fg-secondary'))
    expect(onCard('--color-fg-secondary')).toBeGreaterThan(onCard('--color-fg-muted'))
  })

  it.each(NAV_SURFACES)('fg-nav clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-nav', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each(NAV_WELL_SURFACES)('fg-nav clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-nav', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('keeps fg-nav equal to fg-primary', () => {
    expect(resolve('--color-fg-nav', layers)).toBe(resolve('--color-fg-primary', layers))
  })

  it('separates primary from secondary by at least 1.8x', () => {
    expect(
      ratioBetween('--color-fg-primary', '--color-fg-secondary', layers)
    ).toBeGreaterThanOrEqual(1.8)
  })

  it('separates secondary from muted by at least 1.3x', () => {
    expect(ratioBetween('--color-fg-secondary', '--color-fg-muted', layers)).toBeGreaterThanOrEqual(
      1.3
    )
  })
})

describe('dark theme contrast', () => {
  const layers = [darkLayer, themeLayer]
  const NAV_MUTED_RATCHET: Record<string, number> = {
    '--color-surface-app': 6.8,
    '--color-surface-sidebar': 7.1,
    '--color-surface-nav-active': 4.7
  }

  it.each([...READING_SURFACES, ...WELL_SURFACES])('fg-primary clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-primary', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each([...READING_SURFACES, ...WELL_SURFACES])('fg-secondary clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-secondary', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each(READING_SURFACES)('fg-muted clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-muted', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each(WELL_SURFACES)('fg-muted clears AA on %s', (surface) => {
    expect(ratioOn('--color-fg-muted', surface, layers)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('keeps primary lighter than secondary lighter than muted', () => {
    const onCard = (fg: string) => ratioOn(fg, '--color-surface-card', layers)
    expect(onCard('--color-fg-primary')).toBeGreaterThan(onCard('--color-fg-secondary'))
    expect(onCard('--color-fg-secondary')).toBeGreaterThan(onCard('--color-fg-muted'))
  })

  it.each([...NAV_SURFACES, ...NAV_WELL_SURFACES])(
    'fg-nav-muted holds its floor on %s',
    (surface) => {
      const floor = NAV_MUTED_RATCHET[surface] ?? AA_TEXT
      expect(ratioOn('--color-fg-nav-muted', surface, layers)).toBeGreaterThanOrEqual(floor)
    }
  )

  it('ratchets the dark primary/secondary step', () => {
    expect(
      ratioBetween('--color-fg-primary', '--color-fg-secondary', layers)
    ).toBeGreaterThanOrEqual(1.35)
  })

  it('ratchets the dark secondary/muted step', () => {
    expect(ratioBetween('--color-fg-secondary', '--color-fg-muted', layers)).toBeGreaterThanOrEqual(
      1.3
    )
  })
})

describe('light-island parity', () => {
  const shared = Object.keys(islandLayer).filter((token) => token in themeLayer)
  const themedByDark = Object.keys(darkLayer).filter((token) =>
    /^--color-(?:fg|surface)-/.test(token)
  )

  it.each(shared)('%s matches the @theme light value', (token) => {
    expect(resolve(token, [islandLayer, themeLayer])).toBe(resolve(token, [themeLayer]))
  })

  it.each(themedByDark)('%s is re-declared by .light-island', (token) => {
    expect(islandLayer[token]).toBeDefined()
  })
})

const shadowLayers = (value: string) => {
  const layers: string[] = []
  let depth = 0
  let current = ''
  for (const character of value) {
    if (character === '(') depth++
    else if (character === ')') depth--
    if (character === ',' && depth === 0) {
      layers.push(current)
      current = ''
    } else {
      current += character
    }
  }
  layers.push(current)
  return layers.map((layer) => layer.trim()).filter(Boolean)
}

const withoutFunctions = (value: string) => {
  let out = ''
  let depth = 0
  for (const character of value) {
    if (character === '(') {
      if (depth === 0) out = out.replace(/[\w-]+$/, '')
      depth++
    } else if (character === ')') {
      depth = Math.max(0, depth - 1)
    } else if (depth === 0) {
      out += character
    }
  }
  return out
}

const verticalOffsets = (value: string) =>
  shadowLayers(value).map((layer) => {
    const terms = withoutFunctions(layer)
      .replace(/#[0-9a-fA-F]{3,8}/g, '')
      .replace(/\binset\b/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    const offset = terms[1]
    if (terms.length < 3 || offset === undefined) {
      throw new Error(`no y-offset in shadow layer: ${layer}`)
    }
    return Number.parseFloat(offset)
  })

describe('bottom-bar shadow direction', () => {
  it.each([
    ['light', themeLayer],
    ['dark', darkLayer]
  ])('%s shadow-bar points down for the floating pill', (_theme, layer) => {
    const offsets = verticalOffsets(layer['--shadow-bar']!)
    expect(offsets.some((offset) => offset > 0)).toBe(true)
    expect(offsets.some((offset) => offset < 0)).toBe(false)
  })

  it.each([
    ['light', themeLayer],
    ['dark', darkLayer]
  ])('%s shadow-bar-up points up for the flush bar', (_theme, layer) => {
    const value = layer['--shadow-bar-up']
    expect(value).toBeDefined()
    const offsets = verticalOffsets(value!)
    expect(offsets.some((offset) => offset < 0)).toBe(true)
    expect(offsets.some((offset) => offset > 0)).toBe(false)
  })
})
