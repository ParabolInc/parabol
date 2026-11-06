import {createElement, lazy} from 'react'
import gitLabIntegrationResultsQuery, {
  type GitLabIntegrationResultsQuery
} from '../../__generated__/GitLabIntegrationResultsQuery.graphql'
import gitLabScopingResultsQuery, {
  type GitLabScopingResultsAdapterQuery
} from '../../__generated__/GitLabScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import GitLabSVG from '../../components/GitLabSVG'
import gitlabLogo from '../../styles/theme/images/graphics/gitlab-icon-rgb.svg'
import GitLabClientManager from '../../utils/GitLabClientManager'
import lazyPreload from '../../utils/lazyPreload'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type ScopingCapability,
  type WorkDrawerCapability,
  type WorkDrawerPanelProps
} from '../platform/ClientIntegrationDefinition'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
import makeQueryRoot from '../platform/makeQueryRoot'
import makeScopingResults from '../platform/makeScopingResults'
import {gitLabIssueArgs} from './gitLabIssueArgs'
import gitLabSearchMeta from './gitLabSearchMeta'
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

const workDrawer: WorkDrawerCapability = {
  Panel: makeQueryRoot<WorkDrawerPanelProps, GitLabIntegrationResultsQuery>({
    query: gitLabIntegrationResultsQuery,
    getVariables: ({teamId}) => ({teamId}),
    Component: lazy(
      () =>
        import(
          /* webpackChunkName: 'GitLabIntegrationResults' */ '../../components/TeamPrompt/WorkDrawer/GitLabIntegrationResults'
        )
    )
  }),
  connectDescription: 'issues'
}

export class GitLabClientIntegration extends ClientIntegrationDefinition {
  readonly service = gitlabIntegrationMeta.service
  readonly title = gitlabIntegrationMeta.title
  readonly description = gitlabIntegrationMeta.description
  readonly Icon = GitLabSVG
  readonly logo: ProviderLogoAsset = {src: gitlabLogo}
  readonly capabilities: ClientIntegrationCapabilities = {scoping, workDrawer}
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
