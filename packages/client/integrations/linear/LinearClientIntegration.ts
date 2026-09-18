import {lazy} from 'react'
import linearScopingResultsQuery, {
  type LinearScopingResultsAdapterQuery
} from '../../__generated__/LinearScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import LinearSVG from '../../components/LinearSVG'
import {linearIntegrationMeta} from '../../shared/integrations/linearIntegrationMeta'
import linearLogo from '../../styles/theme/images/graphics/linear.svg'
import LinearClientManager from '../../utils/LinearClientManager'
import {makeLinearIssueFilter} from '../../utils/makeLinearIssueFilter'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type ScopingCapability
} from '../platform/ClientIntegrationDefinition'
import makeScopingResults from '../platform/makeScopingResults'
import linearSearchMeta from './linearSearchMeta'

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
  FilterMenu: lazy(
    () =>
      import(
        /* webpackChunkName: 'LinearScopingSearchFilterMenuRoot' */ '../../components/LinearScopingSearchFilterMenuRoot'
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
  readonly capabilities: ClientIntegrationCapabilities = {scoping}
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId || !provider.serverBaseUrl) return
    void LinearClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, clientId: provider.clientId, serverBaseUrl: provider.serverBaseUrl},
      mutationProps
    )
  }
}
