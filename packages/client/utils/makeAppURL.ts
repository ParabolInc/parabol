interface Options {
  searchParams?: {
    utm_source: string
    utm_medium: string
    utm_campaign: string
    openNotifs?: string
    responseId?: string
  }
}

const makeAppURL = (appOrigin: string, pathname: string, options?: Options) => {
  const searchParams = options?.searchParams ?? ({} as Record<string, string>)
  const url = new URL(appOrigin)
  url.pathname = pathname
  Object.entries(searchParams).forEach((entry) => {
    url.searchParams.append(...entry)
  })
  return url.toString()
}

export default makeAppURL
