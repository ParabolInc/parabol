import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import type {IntegrationScopingPanel_meeting$key} from '../__generated__/IntegrationScopingPanel_meeting.graphql'
import findIntegrationService from '../integrations/platform/findIntegrationService'
import {
  getClientIntegration,
  type RegisteredClientIntegration
} from '../integrations/platform/registry'
import {EMPTY_SCOPING_SEARCH_STATE} from '../integrations/platform/ScopingSearchState'
import ErrorBoundary from './ErrorBoundary'
import IntegrationScopingResults from './IntegrationScopingResults'
import IntegrationScopingSearchBar from './IntegrationScopingSearchBar'

interface Props {
  meetingRef: IntegrationScopingPanel_meeting$key
  service: RegisteredClientIntegration
}

const IntegrationScopingPanel = (props: Props) => {
  const {meetingRef, service} = props
  const meeting = useFragment(
    graphql`
      fragment IntegrationScopingPanel_meeting on PokerMeeting {
        id
        teamId
        scopingSearchQueries {
          service
          queryString
          isAdvancedQuery
          filters {
            key
            value
          }
        }
        viewerMeetingMember {
          teamMember {
            services {
              ...findIntegrationService_auth @relay(mask: false)
              ...usePersistIntegrationSearchQueryMutation_service @relay(mask: false)
            }
          }
        }
        phases {
          ...useGetUsedServiceTaskIds_phase @alias
          phaseType
        }
      }
    `,
    meetingRef
  )
  const scoping = getClientIntegration(service).capabilities.scoping
  const services = meeting.viewerMeetingMember?.teamMember.services ?? []
  const integrationService = findIntegrationService(services, service)
  const providerId = integrationService?.auth?.providerId
  if (!scoping || !providerId) return null
  const {id: meetingId, teamId, phases} = meeting
  const {Results} = scoping
  const context = {meetingId, teamId, providerId}
  const state =
    meeting.scopingSearchQueries.find((searchQuery) => searchQuery.service === service) ??
    EMPTY_SCOPING_SEARCH_STATE
  const savedQueries = integrationService.searchQueries.map(({id, queryString, meta}) => ({
    id,
    queryString,
    ...scoping.parseSavedMeta(meta)
  }))
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')
  return (
    <ErrorBoundary>
      <IntegrationScopingSearchBar
        scoping={scoping}
        service={service}
        context={context}
        state={state}
        savedQueries={savedQueries}
      />
      <Suspense fallback={<MockScopingList />}>
        <Results state={state} context={context}>
          {(results) => (
            <IntegrationScopingResults
              results={results}
              scoping={scoping}
              service={service}
              context={context}
              state={state}
              savedQueries={savedQueries}
              estimatePhaseRef={estimatePhase?.useGetUsedServiceTaskIds_phase ?? null}
            />
          )}
        </Results>
      </Suspense>
    </ErrorBoundary>
  )
}

export default IntegrationScopingPanel
