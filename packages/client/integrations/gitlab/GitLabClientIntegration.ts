import {createElement, lazy} from 'react'
import gitLabScopingResultsQuery, {
  type GitLabScopingResultsAdapterQuery
} from '../../__generated__/GitLabScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import GitLabSVG from '../../components/GitLabSVG'
import gitlabLogo from '../../styles/theme/images/graphics/gitlab-icon-rgb.svg'
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
import GitLabClientManager from './GitLabClientManager'
import {gitLabIssueArgs} from './gitLabIssueArgs'
import gitLabSearchMeta from './gitLabSearchMeta'
import gitLabTaskLink from './gitLabTaskLink'
import {gitlabIntegrationMeta} from './shared/gitlabIntegrationMeta'

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
  readonly searchKeywords = ['git']
  readonly description = gitlabIntegrationMeta.description
  readonly Icon = GitLabSVG
  readonly logo: ProviderLogoAsset = {src: gitlabLogo}
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping,
    taskLink: gitLabTaskLink
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId || !provider.serverBaseUrl) return false
    GitLabClientManager.openOAuth(
      atmosphere,
      provider.id,
      provider.clientId,
      provider.serverBaseUrl,
      teamId,
      mutationProps
    )
    return true
  }
}
