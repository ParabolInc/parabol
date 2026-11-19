import {createElement, lazy} from 'react'
import clickUpScopingResultsQuery, {
  type ClickUpScopingResultsAdapterQuery
} from '../../__generated__/ClickUpScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import clickupLogo from '../../styles/theme/images/graphics/clickup.svg'
import lazyPreload from '../../utils/lazyPreload'
import plural from '../../utils/plural'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type ScopingCapability
} from '../platform/ClientIntegrationDefinition'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
import makeScopingResults from '../platform/makeScopingResults'
import ClickUpClientManager from './ClickUpClientManager'
import ClickUpIcon from './ClickUpIcon'
import clickUpSearchMeta from './clickUpSearchMeta'
import clickUpTaskLink from './clickUpTaskLink'
import {clickupIntegrationMeta} from './shared/clickupIntegrationMeta'

const ClickUpScopingCurrentFiltersRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'ClickUpScopingCurrentFiltersRoot' */ './ClickUpScopingCurrentFiltersRoot'
    )
)

const scoping: ScopingCapability = {
  ...clickUpSearchMeta,
  Results: makeScopingResults<ClickUpScopingResultsAdapterQuery>({
    query: clickUpScopingResultsQuery,
    searchArgs: (state, {teamId}) => ({
      teamId,
      queryString: state.queryString.trim(),
      listIds: searchFiltersByKey(state.filters, 'listIds')
    }),
    ResultsAdapter: lazy(
      () =>
        import(
          /* webpackChunkName: 'ClickUpScopingResultsAdapter' */ './ClickUpScopingResultsAdapter'
        )
    )
  }),
  FilterMenu: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'ClickUpScopingSearchFilterMenu' */ '../../components/ClickUpScopingSearchFilterMenu'
      )
  ),
  NewRecordInput: lazy(
    () =>
      import(
        /* webpackChunkName: 'NewClickUpTaskInputRoot' */ '../../components/NewClickUpTaskInputRoot'
      )
  ),
  placeholder: () => 'Search ClickUp tasks by name, ID or link',
  currentFilters: (state, {teamId}) =>
    createElement(ClickUpScopingCurrentFiltersRoot, {state, teamId}),
  savedFiltersLabel: (filters) => `${filters.length} ${plural(filters.length, 'list')}`,
  selectAllNoun: 'task',
  newRecordLabel: 'New Task'
}

export class ClickUpClientIntegration extends ClientIntegrationDefinition {
  readonly service = clickupIntegrationMeta.service
  readonly title = clickupIntegrationMeta.title
  readonly searchKeywords = ['click up']
  readonly description = clickupIntegrationMeta.description
  readonly Icon = ClickUpIcon
  readonly logo: ProviderLogoAsset = {src: clickupLogo}
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping,
    taskLink: clickUpTaskLink
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId) return false
    ClickUpClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, clientId: provider.clientId},
      mutationProps
    )
    return true
  }
}
