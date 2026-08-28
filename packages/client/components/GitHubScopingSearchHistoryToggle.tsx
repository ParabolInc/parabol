import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {GitHubScopingSearchHistoryToggle_meeting$key} from '../__generated__/GitHubScopingSearchHistoryToggle_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import findIntegrationService from '../integrations/platform/findIntegrationService'
import useRemoveIntegrationSearchQueryMutation from '../mutations/useRemoveIntegrationSearchQueryMutation'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'

interface Props {
  meetingRef: GitHubScopingSearchHistoryToggle_meeting$key
}

const GitHubScopingSearchHistoryToggle = (props: Props) => {
  const {meetingRef} = props
  const atmosphere = useAtmosphere()
  const [removeIntegrationSearchQuery, submitting] = useRemoveIntegrationSearchQueryMutation()
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchHistoryToggle_meeting on PokerMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            teamId
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
  const {id: meetingId, viewerMeetingMember} = meeting!
  if (!viewerMeetingMember) return null
  const {teamMember} = viewerMeetingMember
  const {teamId, services} = teamMember
  const savedQueries = findIntegrationService(services, 'github')?.searchQueries

  const searchQueries =
    savedQueries?.map((savedQuery) => {
      const {id, queryString} = savedQuery

      const selectQuery = () => {
        commitLocalUpdate(atmosphere, (store) => {
          const searchQueryId = SearchQueryId.join('github', meetingId)
          const githubSearchQuery = store.get(searchQueryId)!
          githubSearchQuery.setValue(queryString, 'queryString')
        })
      }

      const deleteQuery = () => {
        if (submitting) return
        removeIntegrationSearchQuery({variables: {id, teamId}})
      }

      return {
        id,
        labelFirstLine: queryString,
        onClick: selectQuery,
        onDelete: deleteQuery
      }
    }) ?? []

  return <ScopingSearchHistoryToggle searchQueries={searchQueries} />
}

export default GitHubScopingSearchHistoryToggle
