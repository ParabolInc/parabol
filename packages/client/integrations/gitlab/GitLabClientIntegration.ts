import {createElement, lazy} from 'react'
import gitLabScopingResultsQuery, {
  type GitLabScopingResultsAdapterQuery
} from '../../__generated__/GitLabScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import GitLabSVG from '../../components/GitLabSVG'
import {gitlabIntegrationMeta} from '../../shared/integrations/gitlabIntegrationMeta'
import gitlabLogo from '../../styles/theme/images/graphics/gitlab-icon-rgb.svg'
import GitLabClientManager from '../../utils/GitLabClientManager'
import lazyPreload from '../../utils/lazyPreload'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type ScopingCapability
} from '../platform/ClientIntegrationDefinition'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
import makeScopingResults from '../platform/makeScopingResults'
import {gitLabIssueArgs} from './gitLabIssueArgs'
import gitLabSearchMeta from './gitLabSearchMeta'

const GitLabScopingCurrentFiltersRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'GitLabScopingCurrentFiltersRoot' */ './GitLabScopingCurrentFiltersRoot'
    )
)

const scoping: ScopingCapability = {
  ...gitLabSearchMeta,
  Results: makeScopingResults<GitLabScopingResultsAdapterQuery>({
    query: gitLabScopingResultsQuery,
    searchArgs: (state, {teamId}) => {
      const projectIds = searchFiltersByKey(state.filters, 'project')
      return {
        teamId,
        queryString: state.queryString.trim(),
        selectedProjectsIds: projectIds.length ? projectIds : null,
        ...gitLabIssueArgs
      }
    },
    ResultsAdapter: lazy(
      () =>
        import(
          /* webpackChunkName: 'GitLabScopingResultsAdapter' */ './GitLabScopingResultsAdapter'
        )
    )
  }),
  FilterMenu: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'GitLabScopingSearchFilterMenuRoot' */ '../../components/GitLabScopingSearchFilterMenuRoot'
      )
  ),
  NewRecordInput: lazy(
    () =>
      import(
        /* webpackChunkName: 'NewGitLabIssueInputRoot' */ '../../components/NewGitLabIssueInputRoot'
      )
  ),
  placeholder: () => 'Search GitLab issues...',
  currentFilters: (state, {teamId}) =>
    createElement(GitLabScopingCurrentFiltersRoot, {state, teamId}),
  selectAllNoun: 'issue'
}

export class GitLabClientIntegration extends ClientIntegrationDefinition {
  readonly service = gitlabIntegrationMeta.service
  readonly title = gitlabIntegrationMeta.title
  readonly description = gitlabIntegrationMeta.description
  readonly Icon = GitLabSVG
  readonly logo: ProviderLogoAsset = {src: gitlabLogo}
  readonly capabilities: ClientIntegrationCapabilities = {scoping}
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId || !provider.serverBaseUrl) return
    GitLabClientManager.openOAuth(
      atmosphere,
      provider.id,
      provider.clientId,
      provider.serverBaseUrl,
      teamId,
      mutationProps
    )
  }
}
