import {lazy} from 'react'
import linearScopingResultsQuery, {
  type LinearScopingResultsAdapterQuery
} from '../../__generated__/LinearScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import LinearSVG from '../../components/LinearSVG'
import linearLogo from '../../styles/theme/images/graphics/linear.svg'
import lazyPreload from '../../utils/lazyPreload'
import {makeLinearIssueFilter} from '../../utils/makeLinearIssueFilter'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type ScopingCapability
} from '../platform/ClientIntegrationDefinition'
import makeScopingResults from '../platform/makeScopingResults'
import LinearClientManager from './LinearClientManager'
import linearSearchMeta from './linearSearchMeta'
import linearTaskLink from './linearTaskLink'
import {linearIntegrationMeta} from './shared/linearIntegrationMeta'

const scoping: ScopingCapability = {
  ...linearSearchMeta,
  Results: makeScopingResults<LinearScopingResultsAdapterQuery>({
    query: linearScopingResultsQuery,
    searchArgs: (state, {teamId}) => ({
      teamId,
      filter: makeLinearIssueFilter(state.queryString.trim(), state.filters)
    }),
    ResultsAdapter: lazy(
      () =>
        import(
          /* webpackChunkName: 'LinearScopingResultsAdapter' */ './LinearScopingResultsAdapter'
        )
    )
  }),
  FilterMenu: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'LinearScopingSearchFilterMenu' */ '../../components/LinearScopingSearchFilterMenu'
      )
  ),
  NewRecordInput: lazy(
    () =>
      import(
        /* webpackChunkName: 'NewLinearIssueInputRoot' */ '../../components/NewLinearIssueInputRoot'
      )
  ),
  placeholder: () => 'Search Linear issues...',
  selectAllNoun: 'issue'
}

export class LinearClientIntegration extends ClientIntegrationDefinition {
  readonly service = linearIntegrationMeta.service
  readonly title = linearIntegrationMeta.title
  readonly description = linearIntegrationMeta.description
  readonly Icon = LinearSVG
  readonly logo: ProviderLogoAsset = {src: linearLogo}
  readonly iconClassName = 'dark:[&_path]:fill-white'
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping,
    taskLink: linearTaskLink
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId || !provider.serverBaseUrl) return false
    void LinearClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, clientId: provider.clientId, serverBaseUrl: provider.serverBaseUrl},
      mutationProps
    )
    return true
  }
}
