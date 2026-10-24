import {lazy} from 'react'
import linearIntegrationPanelQuery, {
  type LinearIntegrationPanelQuery
} from '../../__generated__/LinearIntegrationPanelQuery.graphql'
import linearScopingResultsQuery, {
  type LinearScopingResultsAdapterQuery
} from '../../__generated__/LinearScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import LinearSVG from '../../components/LinearSVG'
import {linearIntegrationMeta} from '../../shared/integrations/linearIntegrationMeta'
import linearLogo from '../../styles/theme/images/graphics/linear.svg'
import LinearClientManager from '../../utils/LinearClientManager'
import lazyPreload from '../../utils/lazyPreload'
import {makeLinearIssueFilter} from '../../utils/makeLinearIssueFilter'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type ScopingCapability,
  type WorkDrawerCapability
} from '../platform/ClientIntegrationDefinition'
import makeScopingResults from '../platform/makeScopingResults'
import makeWorkDrawerPanel from '../platform/makeWorkDrawerPanel'
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
  FilterMenu: lazyPreload(
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

const workDrawer: WorkDrawerCapability = {
  Panel: makeWorkDrawerPanel<LinearIntegrationPanelQuery>({
    query: linearIntegrationPanelQuery,
    Panel: lazy(
      () =>
        import(
          /* webpackChunkName: 'LinearIntegrationPanel' */ '../../components/TeamPrompt/WorkDrawer/LinearIntegrationPanel'
        )
    )
  }),
  connectDescription: 'issues'
}

export class LinearClientIntegration extends ClientIntegrationDefinition {
  readonly service = linearIntegrationMeta.service
  readonly title = linearIntegrationMeta.title
  readonly description = linearIntegrationMeta.description
  readonly Icon = LinearSVG
  readonly logo: ProviderLogoAsset = {src: linearLogo}
  readonly iconClassName = 'dark:[&_path]:fill-white'
  readonly capabilities: ClientIntegrationCapabilities = {scoping, workDrawer}
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
