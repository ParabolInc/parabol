const getAnonymousId = (): string | undefined => {
  const analytics: any = window && window.analytics
  return analytics && typeof analytics.user === 'function'
    ? analytics.user().anonymousId()
    : undefined
}

export default getAnonymousId
