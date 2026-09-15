import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {JiraScopingSearchHistoryToggle_meeting$key} from '../__generated__/JiraScopingSearchHistoryToggle_meeting.graphql'
import findIntegrationService from '../integrations/platform/findIntegrationService'
import useRemoveIntegrationSearchQueryMutation from '../mutations/useRemoveIntegrationSearchQueryMutation'
import JiraUniversalScopingSearchHistoryToggle from './JiraUniversalScopingSearchHistoryToggle'

interface Props {
  meetingRef: JiraScopingSearchHistoryToggle_meeting$key
}

const JiraScopingSearchHistoryToggle = (props: Props) => {
  const {meetingRef} = props
  const [removeIntegrationSearchQuery, submitting] = useRemoveIntegrationSearchQueryMutation()
  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchHistoryToggle_meeting on PokerMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            services {
              ...findIntegrationService_auth @relay(mask: false)
              ...usePersistIntegrationSearchQueryMutation_service @relay(mask: false)
            }
          }
        }
      }
    `,
    meetingRef
  )

  const {id: meetingId, teamId} = meeting
  const services = meeting.viewerMeetingMember?.teamMember.services ?? []
  const savedQueries = findIntegrationService(services, 'jira')?.searchQueries.map(
    ({id, queryString, isJQL, projectKeyFilters}) => ({
      id,
      queryString,
      isJQL: isJQL ?? false,
      projectKeyFilters: projectKeyFilters ?? []
    })
  )
  const onDeleteQuery = (id: string) => {
    if (submitting) return
    removeIntegrationSearchQuery({variables: {id, teamId}})
  }

  return (
    <JiraUniversalScopingSearchHistoryToggle
      service={'jira'}
      savedQueries={savedQueries}
      meetingId={meetingId}
      onDeleteQuery={onDeleteQuery}
    />
  )
}

export default JiraScopingSearchHistoryToggle
