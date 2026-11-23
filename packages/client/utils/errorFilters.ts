export const UPDATE_BROWSER_URL = 'https://browser-update.org/update-browser.html'

// The client ships these without polyfills, so a browser that predates one throws wherever the app calls it
const NEWER_BUILT_INS: [owner: object, names: string[]][] = [
  [
    Array.prototype,
    ['at', 'findLast', 'findLastIndex', 'flatMap', 'toReversed', 'toSorted', 'toSpliced', 'with']
  ],
  [Object, ['hasOwn']],
  [Intl, ['Segmenter']]
]

// Chrome & Firefox: "a.toSorted is not a function". Safari: "undefined is not a constructor (evaluating 'new Intl.Segmenter(...)')"
const MISSING_CALLEE_PATTERNS = [
  /([\w$.]+) is not a (?:function|constructor)/,
  /\(evaluating '(?:new )?([\w$.]+)\(/
]

const isMissingBuiltIn = (name: string) =>
  NEWER_BUILT_INS.some(([owner, names]) => names.includes(name) && !(name in owner))

export const isOldBrowserError = ({message}: Pick<Error, 'message'>) =>
  MISSING_CALLEE_PATTERNS.some((pattern) => {
    const callee = message.match(pattern)?.[1]
    return !!callee && isMissingBuiltIn(callee.slice(callee.lastIndexOf('.') + 1))
  })

export const isNetworkError = ({name}: Error) => {
  return name === 'ChunkLoadError' || name === 'AbortError'
}

// Chrome: "    at fn (script:line:column)" or "    at script:line:column". Firefox and Safari: "fn@script:line:column".
// A browser builtin such as JSON.parse has no line, so its frame never counts as the one that threw
const POSITIONED_FRAME = /^\s*at (?:.+ \()?(.+?):\d+:\d+\)?$|@(.+?):\d+:\d+$/

// the scripts of a stack's frames, the one that threw first
export const getStackScripts = (stack: string | undefined) =>
  (stack ?? '').split('\n').flatMap((line) => {
    const [, v8Script, geckoScript] = line.match(POSITIONED_FRAME) ?? []
    const script = v8Script ?? geckoScript
    return script ? [script] : []
  })

// A production build serves every script from one directory, wherever a CDN or a redirect to one puts it,
// so the directory of this script is the app's. A script that replaced the page's Error adds an <anonymous> frame above it
const ownScript = getStackScripts(new Error().stack).find((script) => script !== '<anonymous>')
const appScriptDirectory = ownScript?.replace(/[?#].*$/, '').replace(/[^/]*$/, '')

// with no directory to compare against, as in development, every script counts as the app's
export const isAppScript = (script: string | undefined) => {
  if (!script) return false
  return !__PRODUCTION__ || !appScriptDirectory || script.startsWith(appScriptDirectory)
}

// an extension, a script injected inline, or another host's script
const isThrownOutsideApp = (stack: string | undefined) => {
  const [throwingScript] = getStackScripts(stack)
  return !!throwingScript && !isAppScript(throwingScript)
}

// Google Translate and extensions like it move the nodes React renders, so React's own removeChild throws NotFoundError
export const isExtensionError = ({name, stack}: Error) => {
  return name === 'NotFoundError' || isThrownOutsideApp(stack)
}

// the session ended, as when another tab signed out, and the app signs this one out when it sees the error
export const isNotSignedInError = ({message}: Error) => {
  return message.includes('Not signed in')
}

export const isIgnoredError = (error: Error) => {
  return (
    isNetworkError(error) ||
    isOldBrowserError(error) ||
    isExtensionError(error) ||
    isNotSignedInError(error)
  )
}
