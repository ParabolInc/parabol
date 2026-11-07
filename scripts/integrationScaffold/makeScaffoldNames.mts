import ScaffoldError from './ScaffoldError.mts'

export interface ScaffoldHosts {
  apiUrl: string
  authorizeUrl: string
  tokenUrl: string
}

export interface ScaffoldNames {
  service: string
  pascal: string
  title: string
  description: string
  envPrefix: string
  redirectSlug: string
  hosts: ScaffoldHosts | null
}

export const SERVICE_PATTERN = /^[a-z][a-zA-Z0-9]*$/

const checkHttpsUrl = (flag: string, value: string) => {
  if (URL.parse(value)?.protocol !== 'https:') {
    throw new ScaffoldError(`${flag} must be an https URL, not "${value}"`)
  }
}

const makePascal = (service: string, title: string) => {
  const titleWord = title.replace(/[^A-Za-z0-9]/g, '')
  if (/^[A-Z]/.test(titleWord) && titleWord.toLowerCase() === service.toLowerCase()) {
    return titleWord
  }
  return service.charAt(0).toUpperCase() + service.slice(1)
}

const makeScaffoldNames = (
  service: string,
  title: string,
  description?: string,
  hosts: ScaffoldHosts | null = null
) => {
  if (hosts) {
    checkHttpsUrl('--api-url', hosts.apiUrl)
    checkHttpsUrl('--authorize-url', hosts.authorizeUrl)
    checkHttpsUrl('--token-url', hosts.tokenUrl)
  }
  const names: ScaffoldNames = {
    service,
    pascal: makePascal(service, title),
    title,
    description: description || `Use ${title} issues from within Parabol.`,
    envPrefix: service.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase(),
    redirectSlug: service.toLowerCase(),
    hosts
  }
  return names
}

export default makeScaffoldNames
