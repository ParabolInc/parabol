import {lazy} from 'react'
import gitHubScopingResultsQuery, {
  type GitHubScopingResultsAdapterQuery
} from '../../__generated__/GitHubScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import GitHubSVG from '../../components/GitHubSVG'
import {githubIntegrationMeta} from '../../shared/integrations/githubIntegrationMeta'
import githubLogo from '../../styles/theme/images/graphics/github-flat.svg'
import githubLogoWhite from '../../styles/theme/images/graphics/github-flat-white.svg'
import GitHubClientManager from '../../utils/GitHubClientManager'
import {gitHubQueryValidation} from '../../validation/gitHubQueryValidation'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type ScopingCapability
} from '../platform/ClientIntegrationDefinition'
import makeScopingResults from '../platform/makeScopingResults'
import gitHubSearchMeta from './gitHubSearchMeta'
import toGitHubQueryString from './gitHubSearchTokens'

const GITHUB_DEFAULT_QUERY = 'is:issue is:open sort:updated involves:@me'

const scoping: ScopingCapability = {
  ...gitHubSearchMeta,
  Results: makeScopingResults<GitHubScopingResultsAdapterQuery>({
    query: gitHubScopingResultsQuery,
    searchArgs: (state, {teamId}) => ({teamId, queryString: toGitHubQueryString(state)}),
    ResultsAdapter: lazy(
      () =>
        import(
          /* webpackChunkName: 'GitHubScopingResultsAdapter' */ './GitHubScopingResultsAdapter'
        )
    )
  }),
  FilterMenu: lazy(
    () =>
      import(
        /* webpackChunkName: 'GitHubScopingSearchFilterMenuRoot' */ '../../components/GitHubScopingSearchFilterMenuRoot'
      )
  ),
  NewRecordInput: lazy(
    () =>
      import(
        /* webpackChunkName: 'NewGitHubIssueInputRoot' */ '../../components/NewGitHubIssueInputRoot'
      )
  ),
  placeholder: () => 'Search GitHub issues...',
  validate: (state) => gitHubQueryValidation(toGitHubQueryString(state)) ?? undefined,
  selectAllNoun: 'issue',
  defaultQueryString: (savedQueries) => savedQueries[0]?.queryString ?? GITHUB_DEFAULT_QUERY,
  isDefaultQuery: (state) =>
    state.filters.length === 0 && state.queryString.toLowerCase().trim() === GITHUB_DEFAULT_QUERY
}

export class GitHubClientIntegration extends ClientIntegrationDefinition {
  readonly service = githubIntegrationMeta.service
  readonly title = githubIntegrationMeta.title
  readonly description = githubIntegrationMeta.description
  readonly Icon = GitHubSVG
  readonly logo: ProviderLogoAsset = {src: githubLogo, darkSrc: githubLogoWhite}
  readonly iconClassName = 'dark:[&_path]:fill-white'
  readonly capabilities: ClientIntegrationCapabilities = {scoping}
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId) return
    GitHubClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, clientId: provider.clientId},
      mutationProps
    )
  }
}
