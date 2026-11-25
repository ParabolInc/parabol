import {selectOAuthAPIProvider} from '../postgres/select'

export type MCPToolset = 'all' | 'curated'

const CURATED_CLIENT_HOSTS = ['chatgpt.com']

const isCuratedRedirectUri = (uri: string) => {
  try {
    return CURATED_CLIENT_HOSTS.includes(new URL(uri).hostname)
  } catch {
    return false
  }
}

const getMCPToolset = async (clientId: string | undefined): Promise<MCPToolset> => {
  if (!clientId) return 'all'
  const provider = await selectOAuthAPIProvider()
    .where('clientId', '=', clientId)
    .executeTakeFirst()
  return provider?.redirectUris.some(isCuratedRedirectUri) ? 'curated' : 'all'
}

export default getMCPToolset
