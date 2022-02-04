export const isOldBrowserError = (message: string) => {
  const oldBrowserErrors = ['flatMap is not a function']
  return !!oldBrowserErrors.find((err) => message.includes(err))
}
