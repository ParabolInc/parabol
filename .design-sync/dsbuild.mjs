// Wrapper around package-build.mjs that injects a host-environment shim into
// the emitted _ds_bundle.js. Parabol's client modules read a server-injected
// global config (window.__ACTION__) at module scope; in an isolated preview
// that global is absent, so the bundle IIFE throws on load and never assigns
// window.<GLOBAL>. The shim defines a benign __ACTION__ BEFORE any module
// initializes (prepended after the @ds-bundle header line, ahead of the IIFE).
//
// Usage: node .design-sync/dsbuild.mjs <same args as package-build.mjs>
import {spawnSync} from 'node:child_process'
import {readFileSync, writeFileSync} from 'node:fs'
import {join, dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DS = resolve(HERE, '../.ds-sync')
const args = process.argv.slice(2)
const out = (() => {
  const i = args.indexOf('--out')
  return i >= 0 ? args[i + 1] : './ds-bundle'
})()

const r = spawnSync('node', [join(DS, 'package-build.mjs'), ...args], {stdio: 'inherit'})
if (r.status !== 0) process.exit(r.status ?? 1)

// Host-environment shim. window.__ACTION__ must be a defined object so reads
// like window.__ACTION__.GOOGLE_ERROR_FORM_URL / .publicPath return undefined
// (handled by the app's own falsy-guards) instead of throwing on undefined.
const SHIM =
  ';(function(){try{if(typeof window!=="undefined"){' +
  'if(!window.__ACTION__)window.__ACTION__={};' +
  'if(window.__ACTION__.publicPath==null)window.__ACTION__.publicPath="/";' +
  '}}catch(e){}})();\n'

const bundlePath = join(out, '_ds_bundle.js')
const body = readFileSync(bundlePath, 'utf8')
if (body.includes('__dsHostShim')) process.exit(0)
const nl = body.indexOf('\n')
// Keep the @ds-bundle header as line 1; inject the shim immediately after it.
const header = body.slice(0, nl + 1)
const rest = body.slice(nl + 1)
writeFileSync(bundlePath, header + '/* __dsHostShim */' + SHIM + rest)
console.error('  + host-environment shim injected (window.__ACTION__)')
