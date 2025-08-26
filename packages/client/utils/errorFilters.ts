export const isOldBrowserError = ({message}: Error) => {
  const oldBrowserErrors = ['flatMap is not a function', 'Intl.Segmenter is not a constructor']
  return !!oldBrowserErrors.find((err) => message.includes(err))
}

export const isNetworkError = ({name}: Error) => {
  return name === 'ChunkLoadError' || name === 'AbortError'
}

export const isExtensionError = ({name, stack}: Error) => {
  return name === 'NotFoundError' || !!stack?.includes('chrome-extension')
}

export const isIgnoredError = (error: Error) => {
  return isNetworkError(error) || isOldBrowserError(error) || isExtensionError(error)
}
