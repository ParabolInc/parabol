import {lazy} from 'react'
import azureDevOpsScopingResultsQuery, {
  type AzureDevOpsScopingResultsAdapterQuery
} from '../../__generated__/AzureDevOpsScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import AzureDevOpsSVG from '../../components/AzureDevOpsSVG'
import {azureDevOpsIntegrationMeta} from '../../shared/integrations/azureDevOpsIntegrationMeta'
import azureDevOpsLogo from '../../styles/theme/images/graphics/azure-devops.svg'
import AzureDevOpsClientManager from '../../utils/AzureDevOpsClientManager'
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
import azureDevOpsSearchMeta from './azureDevOpsSearchMeta'

const scoping: ScopingCapability = {
  ...azureDevOpsSearchMeta,
  Results: makeScopingResults<AzureDevOpsScopingResultsAdapterQuery>({
    query: azureDevOpsScopingResultsQuery,
    searchArgs: (state, {teamId}) => ({
      teamId,
      first: 25,
      queryString: state.queryString.trim(),
      projectKeyFilters: searchFiltersByKey(state.filters, 'project'),
      isWIQL: state.isAdvancedQuery
    }),
    ResultsAdapter: lazy(
      () =>
        import(
          /* webpackChunkName: 'AzureDevOpsScopingResultsAdapter' */ './AzureDevOpsScopingResultsAdapter'
        )
    )
  }),
  FilterMenu: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'AzureDevOpsScopingSearchFilterMenuRoot' */ '../../components/AzureDevOpsScopingSearchFilterMenuRoot'
      )
  ),
  NewRecordInput: lazy(
    () =>
      import(
        /* webpackChunkName: 'NewAzureIssueInputRoot' */ '../../components/NewAzureIssueInputRoot'
      )
  ),
  placeholder: (state) =>
    state.isAdvancedQuery
      ? `[System.WorkItemType] = 'User Story' AND [System.State] <> 'Closed'`
      : 'Search issues on Azure DevOps',
  newRecordLabel: 'New User Story'
}

export class AzureDevOpsClientIntegration extends ClientIntegrationDefinition {
  readonly service = azureDevOpsIntegrationMeta.service
  readonly title = azureDevOpsIntegrationMeta.title
  readonly description = azureDevOpsIntegrationMeta.description
  readonly Icon = AzureDevOpsSVG
  readonly logo: ProviderLogoAsset = {src: azureDevOpsLogo}
  readonly capabilities: ClientIntegrationCapabilities = {scoping}
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId) return
    void AzureDevOpsClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, tenantId: provider.tenantId, clientId: provider.clientId},
      mutationProps
    )
  }
}
