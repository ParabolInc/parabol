export const isOldBrowserError = ({message}: Error) => {
  const oldBrowserErrors = ['flatMap is not a function', 'Intl.Segmenter is not a constructor']
  return !!oldBrowserErrors.find((err) => message.includes(err))
}

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
