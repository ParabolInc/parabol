import {createElement, lazy} from 'react'
import jiraScopingResultsQuery, {
  type JiraScopingResultsAdapterQuery
} from '../../__generated__/JiraScopingResultsAdapterQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import JiraSVG from '../../components/JiraSVG'
import JiraProjectId from '../../shared/gqlIds/JiraProjectId'
import {searchFiltersByKey} from '../../shared/integrations/IntegrationSearchFilter'
import {jiraIntegrationMeta} from '../../shared/integrations/jiraIntegrationMeta'
import atlassianLogo from '../../styles/theme/images/graphics/atlassian-gradient.svg'
import {ExternalLinks} from '../../types/constEnums'
import AtlassianClientManager from '../../utils/AtlassianClientManager'
import {describeAtlassianDisconnect} from '../../utils/atlassianScopes'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type ScopingCapability
} from '../platform/ClientIntegrationDefinition'
import makeScopingResults from '../platform/makeScopingResults'
import jiraSearchMeta from './jiraSearchMeta'

const JiraScopingCurrentFilters = lazy(
  () => import(/* webpackChunkName: 'JiraScopingCurrentFilters' */ './JiraScopingCurrentFilters')
)

const scoping: ScopingCapability = {
  ...jiraSearchMeta,
  Results: makeScopingResults<JiraScopingResultsAdapterQuery>({
    query: jiraScopingResultsQuery,
    searchArgs: (state, {teamId}) => ({
      teamId,
      queryString: state.queryString.trim(),
      isJQL: state.isAdvancedQuery,
      projectKeyFilters: searchFiltersByKey(state.filters, 'project'),
      first: 100
    }),
    ResultsAdapter: lazy(
      () =>
        import(/* webpackChunkName: 'JiraScopingResultsAdapter' */ './JiraScopingResultsAdapter')
    )
  }),
  FilterMenu: lazy(
    () =>
      import(
        /* webpackChunkName: 'JiraScopingSearchFilterMenuRoot' */ '../../components/JiraScopingSearchFilterMenuRoot'
      )
  ),
  NewRecordInput: lazy(
    () =>
      import(
        /* webpackChunkName: 'NewJiraIssueInputRoot' */ '../../components/NewJiraIssueInputRoot'
      )
  ),
  placeholder: (state) =>
    state.isAdvancedQuery ? 'SPRINT = fun AND PROJECT = dev' : 'Search issues on Jira',
  currentFilters: (state, {teamId}) => createElement(JiraScopingCurrentFilters, {state, teamId}),
  filterChipLabel: (filter) => JiraProjectId.split(filter.value).projectKey,
  selectAllNoun: 'issue'
}

export class JiraClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraIntegrationMeta.service
  readonly title = jiraIntegrationMeta.title
  readonly description = jiraIntegrationMeta.description
  readonly Icon = JiraSVG
  readonly logo: ProviderLogoAsset = {src: atlassianLogo}
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping,
    settings: {
      getDisconnectSubline: describeAtlassianDisconnect
    }
  }
  readonly authorizationHelpUrl = ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_AUTHORIZATION
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider, heldScopes}: ConnectParams) {
    if (!provider?.clientId) return
    AtlassianClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, clientId: provider.clientId},
      mutationProps,
      AtlassianClientManager.JIRA_SCOPE,
      heldScopes
    )
  }
}
