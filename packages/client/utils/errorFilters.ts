export const isOldBrowserError = ({message}: Error) => {
  const oldBrowserErrors = ['flatMap is not a function', 'Intl.Segmenter is not a constructor']
  return !!oldBrowserErrors.find((err) => message.includes(err))
}

export const isNetworkError = ({name}: Error) => {
  return name === 'ChunkLoadError' || name === 'AbortError'
}

// Safari hides the URL of every extension script behind webkit-masked-url
const EXTENSION_URL_SCHEMES = [
  'chrome-extension://',
  'moz-extension://',
  'safari-web-extension://',
  'webkit-masked-url://'
]

export const isFromExtension = (source: string | undefined) => {
  return EXTENSION_URL_SCHEMES.some((scheme) => source?.includes(scheme))
}

// A script injected inline has no URL, so its frames read <anonymous> with a line, where a browser builtin's have none
const isThrownByInjectedScript = (stack: string | undefined) => {
  const throwingFrame = stack?.split('\n').find((line) => line.trim().startsWith('at '))
  return !!throwingFrame && /\(<anonymous>:\d+:\d+\)$/.test(throwingFrame)
}

// A program that embeds Chromium with CefSharp, as link scanners do, rejects with this when its injected script calls an object it unbound
const isCefSharpBindingError = (message: string) => {
  return message.startsWith('Object Not Found Matching Id:')
}

export const isExtensionError = ({name, message, stack}: Error) => {
  return (
    name === 'NotFoundError' ||
    isFromExtension(stack) ||
    isThrownByInjectedScript(stack) ||
    isCefSharpBindingError(message)
  )
}

export const isIgnoredError = (error: Error) => {
  return isNetworkError(error) || isOldBrowserError(error) || isExtensionError(error)
}

export const isNotSignedInError = ({message}: Error) => {
  return message.includes('Not signed in')
}
