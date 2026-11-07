import type {ScaffoldNames} from './makeScaffoldNames.mts'
import type {ScaffoldFile} from './ScaffoldFile.mts'

const notImplemented = (title: string, what: string) =>
  `new Error(${JSON.stringify(`${title}: ${what} is not implemented`)})`

const serverFiles = ({service, pascal, title}: ScaffoldNames): ScaffoldFile[] => {
  const dir = `packages/server/integrations/${service}`
  const meta = `${service}IntegrationMeta`
  return [
    {
      path: `${dir}/${pascal}ServerIntegration.ts`,
      contents: `import {${meta}} from 'parabol-client/integrations/${service}/shared/${meta}'
import {
  type EstimatePushCapability,
  type IssueCreateCapability,
  type IssueReadCapability,
  type IssueSearchCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import build${pascal}SearchQuery from './build${pascal}SearchQuery'
import describe${pascal}DimensionField from './describe${pascal}DimensionField'
import fetch${pascal}Repos, {type ${pascal}Repo} from './fetch${pascal}Repos'
import list${pascal}DimensionFields from './list${pascal}DimensionFields'
import parse${pascal}IntegrationHash from './parse${pascal}IntegrationHash'
import pushEstimateTo${pascal} from './pushEstimateTo${pascal}'
import resolve${pascal}DimensionFieldKey from './resolve${pascal}DimensionFieldKey'
import resolve${pascal}TaskIntegration from './resolve${pascal}TaskIntegration'
import ${pascal}ServerManager from './${pascal}ServerManager'

export class ${pascal}ServerIntegration extends ServerIntegrationDefinition {
  readonly service = ${meta}.service
  readonly title = ${meta}.title
  readonly authStrategy = 'oauth2' as const

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    issueSearch: IssueSearchCapability
    repoList: RepoListCapability<${pascal}Repo>
    estimatePush: EstimatePushCapability
  } = {
    issueCreate: {
      initManager: async (ctx) => {
        const auth = await this.resolveAuth(ctx)
        return auth ? new ${pascal}ServerManager(auth) : null
      }
    },
    issueRead: {
      getIssue: resolve${pascal}TaskIntegration,
      parseIntegrationHash: parse${pascal}IntegrationHash
    },
    issueSearch: {buildQuery: build${pascal}SearchQuery},
    repoList: {
      fetchRepos: fetch${pascal}Repos,
      integrationRepoId: (repo) => repo.id,
      name: (repo) => repo.name
    },
    estimatePush: {
      targets: ['comment'],
      pushEstimate: pushEstimateTo${pascal},
      resolveDimensionFieldKey: resolve${pascal}DimensionFieldKey,
      describeDimensionField: describe${pascal}DimensionField,
      listDimensionFields: list${pascal}DimensionFields
    }
  }
}
`
    },
    {
      path: `${dir}/${pascal}OAuth2Manager.ts`,
      contents: `import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2RefreshAuthorizationParams,
  type OAuth2RefreshResponse,
  type OAuth2TokenResponse
} from '../OAuth2Manager'

const TOKEN_PATH = '/oauth/token'

export default class ${pascal}OAuth2Manager extends OAuth2Manager {
  static readonly REDIRECT_URI = makeAppURL(appOrigin, 'auth/${service}')

  async authorize(code: string) {
    const auth = await this.fetchToken<OAuth2TokenResponse>({
      grant_type: 'authorization_code',
      code,
      redirect_uri: ${pascal}OAuth2Manager.REDIRECT_URI
    })
    if (auth instanceof Error) return auth
    return {...auth, providerUserId: null}
  }

  async refresh(refreshToken: string) {
    return this.fetchToken<OAuth2RefreshResponse>({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

  protected async fetchToken<TSuccess>(
    partialAuthParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ) {
    return authorizeOAuth2<TSuccess>({
      authUrl: new URL(TOKEN_PATH, this.serverBaseUrl).toString(),
      body: {client_id: this.clientId, client_secret: this.clientSecret, ...partialAuthParams},
      contentType: 'application/x-www-form-urlencoded'
    })
  }
}
`
    },
    {
      path: `${dir}/${pascal}ServerManager.ts`,
      contents: `import {${meta}} from 'parabol-client/integrations/${service}/shared/${meta}'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import type {CreateTaskResponse, TaskIntegrationManager} from '../platform/TaskIntegrationManager'

export default class ${pascal}ServerManager implements TaskIntegrationManager {
  readonly title = ${meta}.title
  readonly auth: TeamMemberIntegrationAuth

  constructor(auth: TeamMemberIntegrationAuth) {
    this.auth = auth
  }

  async createTask(): Promise<CreateTaskResponse> {
    return ${notImplemented(title, 'creating an issue')}
  }

  async addCreatedBySomeoneElseComment(): Promise<string | Error> {
    return ${notImplemented(title, 'commenting on an issue')}
  }
}
`
    },
    {
      path: `${dir}/fetch${pascal}Repos.ts`,
      contents: `import type {RepoListCapability} from '../platform/ServerIntegrationDefinition'

export interface ${pascal}Repo {
  service: '${service}'
  id: string
  name: string
}

const fetch${pascal}Repos: RepoListCapability<${pascal}Repo>['fetchRepos'] = async () =>
  ${notImplemented(title, 'listing repos')}

export default fetch${pascal}Repos
`
    },
    {
      path: `${dir}/resolve${pascal}TaskIntegration.ts`,
      contents: `import type {IssueReadCapability} from '../platform/ServerIntegrationDefinition'

const resolve${pascal}TaskIntegration: IssueReadCapability['getIssue'] = async () => null

export default resolve${pascal}TaskIntegration
`
    },
    {
      path: `${dir}/parse${pascal}IntegrationHash.ts`,
      contents: `import ${pascal}IssueId from 'parabol-client/integrations/${service}/shared/${pascal}IssueId'

const parse${pascal}IntegrationHash = (integrationHash: string) => {
  const {repoId, issueId} = ${pascal}IssueId.split(integrationHash)
  if (!repoId || !issueId || ${pascal}IssueId.join(repoId, issueId) !== integrationHash) return null
  return {service: '${service}' as const, repoId, issueId}
}

export default parse${pascal}IntegrationHash
`
    },
    {
      path: `${dir}/build${pascal}SearchQuery.ts`,
      contents: `import {checkQueryString, rejectUnknownKeys} from '../platform/searchMeta'
import type {IssueSearchCapability} from '../platform/ServerIntegrationDefinition'

const build${pascal}SearchQuery: IssueSearchCapability['buildQuery'] = (queryString, meta) => {
  const invalid = checkQueryString(queryString) ?? rejectUnknownKeys(meta)
  if (invalid) return invalid
  return {queryString: queryString.trim()}
}

export default build${pascal}SearchQuery
`
    },
    {
      path: `${dir}/pushEstimateTo${pascal}.ts`,
      contents: `import type {EstimatePushCapability} from '../platform/ServerIntegrationDefinition'

const pushEstimateTo${pascal}: EstimatePushCapability['pushEstimate'] = async () =>
  ${notImplemented(title, 'pushing an estimate')}

export default pushEstimateTo${pascal}
`
    },
    {
      path: `${dir}/resolve${pascal}DimensionFieldKey.ts`,
      contents: `import type {EstimatePushCapability} from '../platform/ServerIntegrationDefinition'

const resolve${pascal}DimensionFieldKey: EstimatePushCapability['resolveDimensionFieldKey'] =
  async () => null

export default resolve${pascal}DimensionFieldKey
`
    },
    {
      path: `${dir}/describe${pascal}DimensionField.ts`,
      contents: `import type {EstimatePushCapability} from '../platform/ServerIntegrationDefinition'

const describe${pascal}DimensionField: EstimatePushCapability['describeDimensionField'] = async () =>
  ${notImplemented(title, 'mapping a dimension to a field')}

export default describe${pascal}DimensionField
`
    },
    {
      path: `${dir}/list${pascal}DimensionFields.ts`,
      contents: `import type {EstimatePushCapability} from '../platform/ServerIntegrationDefinition'

const list${pascal}DimensionFields: EstimatePushCapability['listDimensionFields'] = async () => ({
  options: []
})

export default list${pascal}DimensionFields
`
    }
  ]
}

export default serverFiles
