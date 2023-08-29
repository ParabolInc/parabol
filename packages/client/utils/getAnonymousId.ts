import ReactGA from 'react-ga4'

const retrieveGtagClientId = async (
  gtag: any,
  measurementId: string
): Promise<string | undefined> => {
  return new Promise((resolve) => {
    gtag('get', measurementId, 'client_id', resolve)
    // if the call gets blocked, then it might never resolve
    window.setTimeout(() => resolve(undefined), 1000)
  })
}

const getAnonymousId = async (): Promise<string | undefined> => {
  if (!ReactGA.isInitialized) return

  const gtag = window && window.gtag
  const measurementId = window.__ACTION__.googleAnalytics
  if (!gtag || !measurementId) return
  return await retrieveGtagClientId(gtag, measurementId)
}

export default getAnonymousId
