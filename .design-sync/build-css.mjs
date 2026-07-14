// Compiles Parabol's Tailwind v4 global.css into a static stylesheet for the
// design-system bundle. Runs the @tailwindcss/postcss plugin with the repo's
// own @config (tailwind.config.js) and scans packages/client for used classes.
import {readFileSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'

const REPO = resolve(process.argv[2] || '.')
const input = resolve(REPO, 'packages/client/styles/theme/global.css')
const out = resolve(REPO, process.argv[3] || 'ds-bundle/_ds_tailwind.css')

// Also scan the authored preview files so utility classes used ONLY in
// previews (e.g. h-96, w-56 for demo layout) are emitted — the app's own
// content glob doesn't cover them, and Tailwind v4 JIT drops unseen classes.
const previewsDir = resolve(REPO, '.design-sync/previews')
const shimsDir = resolve(REPO, '.design-sync/shims')
const css =
  `@source "${previewsDir}";\n@source "${shimsDir}";\n` + readFileSync(input, 'utf8')
const result = await postcss([tailwind()]).process(css, {from: input, to: out})
// Strip @font-face blocks — their url()s point at /static/fonts/ (absolute,
// unresolvable under the package). Fonts ship via cfg.extraFonts (fonts.css)
// instead, which resolves against the repo root.
const stripped = result.css.replace(/@font-face\s*\{[^}]*\}/g, '')
writeFileSync(out, stripped)
console.error(`wrote ${out} (${(stripped.length / 1024).toFixed(1)} KiB, @font-face stripped)`)
