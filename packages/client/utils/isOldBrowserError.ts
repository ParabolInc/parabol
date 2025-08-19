export const isOldBrowserError = (message: string) => {
  const oldBrowserErrors = ['flatMap is not a function', 'Intl.Segmenter is not a constructor']
  return !!oldBrowserErrors.find((err) => message.includes(err))
}
