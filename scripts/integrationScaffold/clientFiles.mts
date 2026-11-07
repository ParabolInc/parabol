import type {ScaffoldNames} from './makeScaffoldNames.mts'
import type {ScaffoldFile} from './ScaffoldFile.mts'

const clientFiles = ({
  service,
  pascal,
  title,
  description,
  redirectSlug,
  hosts
}: ScaffoldNames): ScaffoldFile[] => {
  const dir = `packages/client/integrations/${service}`
  const meta = `${service}IntegrationMeta`
  const logo = `packages/client/styles/theme/images/graphics/${service}.svg`
  const oauth = hosts
    ? {
        connectCheck: '!provider?.clientId',
        providerArg: '{id: provider.id, clientId: provider.clientId}',
        providerType: '{id: string; clientId: string}',
        providerFields: 'id: providerId, clientId',
        authorizeConstant: `const AUTHORIZE_URL = ${JSON.stringify(hosts.authorizeUrl)}`,
        authorizeUrl: 'new URL(AUTHORIZE_URL)'
      }
    : {
        connectCheck: '!provider?.clientId || !provider.serverBaseUrl',
        providerArg:
          '{id: provider.id, clientId: provider.clientId, serverBaseUrl: provider.serverBaseUrl}',
        providerType: '{id: string; clientId: string; serverBaseUrl: string}',
        providerFields: 'id: providerId, clientId, serverBaseUrl',
        authorizeConstant: `const AUTH_PATH = '/oauth/authorize'`,
        authorizeUrl: 'new URL(AUTH_PATH, serverBaseUrl)'
      }
  return [
    {
      path: `${dir}/shared/${meta}.ts`,
      contents: `import type {IntegrationMeta} from '../../../shared/integrations/IntegrationMeta'

export const ${meta} = {
  service: '${service}',
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)}
} satisfies IntegrationMeta
`
    },
    {
      path: `${dir}/shared/${pascal}IssueId.ts`,
      contents: `const INTEGRATION_HASH = /^([A-Za-z0-9_-]+)::([A-Za-z0-9_-]+)$/

const ${pascal}IssueId = {
  join: (repoId: string, issueId: string) => \`\${repoId}::\${issueId}\`,
  split: (integrationHash: string) => {
    const [, repoId, issueId] = INTEGRATION_HASH.exec(integrationHash) ?? []
    if (!repoId || !issueId) return null
    return {repoId, issueId}
  }
}

export default ${pascal}IssueId
`
    },
    {
      path: `${dir}/__tests__/${pascal}IssueId.test.ts`,
      contents: `import ${pascal}IssueId from '../shared/${pascal}IssueId'

describe('${pascal}IssueId', () => {
  it('round-trips join and split', () => {
    const integrationHash = ${pascal}IssueId.join('repo1', 'issue1')
    expect(${pascal}IssueId.split(integrationHash)).toEqual({repoId: 'repo1', issueId: 'issue1'})
  })

  it.each(['', 'repo1', 'repo1::', '::issue1', 'repo1::issue1::x', 'repo1::../../x'])(
    'rejects %p',
    (integrationHash) => {
      expect(${pascal}IssueId.split(integrationHash)).toBeNull()
    }
  )
})
`
    },
    {
      path: `${dir}/${pascal}Icon.tsx`,
      contents: `import ${service}Logo from '../../styles/theme/images/graphics/${service}.svg'
import {cn} from '../../ui/cn'

interface Props {
  className?: string
}

const ${pascal}Icon = ({className}: Props) => (
  <img src={${service}Logo} alt='' className={cn('h-6 w-6', className)} />
)

export default ${pascal}Icon
`
    },
    {
      path: `${dir}/${pascal}ClientIntegration.ts`,
      contents: `import type Atmosphere from '../../Atmosphere'
import ${service}Logo from '../../styles/theme/images/graphics/${service}.svg'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset
} from '../platform/ClientIntegrationDefinition'
import ${pascal}ClientManager from './${pascal}ClientManager'
import ${pascal}Icon from './${pascal}Icon'
import {${meta}} from './shared/${meta}'

export class ${pascal}ClientIntegration extends ClientIntegrationDefinition {
  readonly service = ${meta}.service
  readonly title = ${meta}.title
  readonly description = ${meta}.description
  readonly Icon = ${pascal}Icon
  readonly logo: ProviderLogoAsset = {src: ${service}Logo}
  readonly capabilities: ClientIntegrationCapabilities = {}
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (${oauth.connectCheck}) return false
    ${pascal}ClientManager.openOAuth(
      atmosphere,
      teamId,
      ${oauth.providerArg},
      mutationProps
    )
    return true
  }
}
`
    },
    {
      path: `${dir}/${pascal}ClientManager.ts`,
      contents: `import type Atmosphere from '../../Atmosphere'
import {OAUTH_LOCAL_STORAGE_KEY} from '../../components/AuthProvider'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../../mutations/AddTeamMemberIntegrationAuthMutation'
import getOAuthPopupFeatures from '../../utils/getOAuthPopupFeatures'
import makeHref from '../../utils/makeHref'

const SCOPES = ''
${oauth.authorizeConstant}
const REDIRECT_PATH = '/auth/${redirectSlug}'
const POLLING_INTERVAL = 250
const POPUP_LIFETIME = 2 * 60 * 1000

const ${pascal}ClientManager = {
  openOAuth(
    atmosphere: Atmosphere,
    teamId: string,
    provider: ${oauth.providerType},
    mutationProps: MenuMutationProps
  ) {
    const {${oauth.providerFields}} = provider
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const hash = Math.random().toString(36).substring(5)
    const providerState = btoa(
      JSON.stringify({hash, origin: window.location.origin, service: '${service}'})
    )
    const url = ${oauth.authorizeUrl}
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('scope', SCOPES)
    url.searchParams.set('state', providerState)
    url.searchParams.set('redirect_uri', makeHref(REDIRECT_PATH))
    url.searchParams.set('response_type', 'code')
    const popup = window.open(
      url.toString(),
      '${pascal}Auth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )

    const cleanup = () => {
      clearInterval(pollingIntervalId)
      window.removeEventListener('message', messageHandler)
    }

    const processOAuthData = (data: {code: string; state: string}) => {
      if (submitting) return
      const {code, state} = data
      if (state !== providerState || typeof code !== 'string') return
      localStorage.removeItem(OAUTH_LOCAL_STORAGE_KEY)
      submitMutation()
      AddTeamMemberIntegrationAuthMutation(
        atmosphere,
        {providerId, oauthCodeOrPat: code, teamId},
        {onError, onCompleted}
      )
      popup?.close()
      cleanup()
    }

    const messageHandler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin) return
      processOAuthData(event.data)
    }

    const checkLocalStorage = () => {
      const storedData = localStorage.getItem(OAUTH_LOCAL_STORAGE_KEY)
      if (!storedData) return
      try {
        processOAuthData(JSON.parse(storedData))
      } catch (error) {
        console.error('Error checking localStorage for OAuth data:', error)
      }
    }

    window.addEventListener('message', messageHandler)
    const pollingIntervalId = setInterval(checkLocalStorage, POLLING_INTERVAL)
    checkLocalStorage()
    setTimeout(cleanup, POPUP_LIFETIME)
  }
}

export default ${pascal}ClientManager
`
    },
    {
      path: logo,
      contents: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="48" fill="#475569"/><text x="128" y="168" fill="#fff" font-family="sans-serif" font-size="128" font-weight="700" text-anchor="middle">${title.charAt(0).toUpperCase()}</text></svg>
`
    }
  ]
}

export default clientFiles
