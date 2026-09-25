import {createElement, lazy} from 'react'
import jiraServerScopingResultsQuery, {
  type JiraServerScopingResultsAdapterQuery
} from '../../__generated__/JiraServerScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import JiraServerSVG from '../../components/JiraServerSVG'
import IntegrationRepoId from '../../shared/gqlIds/IntegrationRepoId'
import {jiraServerIntegrationMeta} from '../../shared/integrations/jiraServerIntegrationMeta'
import jiraServerLogo from '../../styles/theme/images/graphics/jira-software-blue.svg'
import {ExternalLinks} from '../../types/constEnums'
import JiraServerClientManager from '../../utils/JiraServerClientManager'
import lazyPreload from '../../utils/lazyPreload'
import jiraSearchMeta from '../jira/jiraSearchMeta'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type ScopingCapability
} from '../platform/ClientIntegrationDefinition'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
import makeScopingResults from '../platform/makeScopingResults'

const JiraServerScopingCurrentFiltersRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'JiraServerScopingCurrentFiltersRoot' */ './JiraServerScopingCurrentFiltersRoot'
    )
)

const scoping: ScopingCapability = {
  ...jiraSearchMeta,
  Results: makeScopingResults<JiraServerScopingResultsAdapterQuery>({
    query: jiraServerScopingResultsQuery,
    searchArgs: (state, {teamId}) => ({
      teamId,
      queryString: state.queryString.trim(),
      isJQL: state.isAdvancedQuery,
      projectKeyFilters: searchFiltersByKey(state.filters, 'project')
    }),
    ResultsAdapter: lazy(
      () =>
        import(
          /* webpackChunkName: 'JiraServerScopingResultsAdapter' */ './JiraServerScopingResultsAdapter'
        )
    )
  }),
  FilterMenu: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'JiraServerScopingSearchFilterMenuRoot' */ '../../components/JiraServerScopingSearchFilterMenuRoot'
      )
  ),
  placeholder: (state) =>
    state.isAdvancedQuery ? 'SPRINT = fun AND PROJECT = dev' : 'Search issues on Jira Data Center',
  currentFilters: (state, {teamId}) =>
    createElement(JiraServerScopingCurrentFiltersRoot, {state, teamId}),
  filterChipLabel: (filter) => IntegrationRepoId.split(filter.value).projectKey ?? filter.value
}

export class JiraServerClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraServerIntegrationMeta.service
  readonly title = jiraServerIntegrationMeta.title
  readonly description = jiraServerIntegrationMeta.description
  readonly Icon = JiraServerSVG
  readonly logo: ProviderLogoAsset = {src: jiraServerLogo}
  readonly capabilities: ClientIntegrationCapabilities = {scoping}
  readonly contactUs = {
    url: ExternalLinks.INTEGRATIONS_JIRASERVER,
    clickEvent: 'Clicked Jira Server Request Button'
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider) return
    JiraServerClientManager.openOAuth(atmosphere, provider.id, teamId, mutationProps)
  }
}
