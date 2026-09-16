import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {GitHubScopingSearchBar_meeting$key} from '../__generated__/GitHubScopingSearchBar_meeting.graphql'
import findIntegrationService from '../integrations/platform/findIntegrationService'
import {SprintPokerDefaults} from '../types/constEnums'
import GitHubScopingSearchFilterToggle from './GitHubScopingSearchFilterToggle'
import GitHubScopingSearchHistoryToggle from './GitHubScopingSearchHistoryToggle'
import ScopingSearchBar from './ScopingSearchBar'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  meetingRef: GitHubScopingSearchBar_meeting$key
}

const GitHubScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchBar_meeting on PokerMeeting {
        id
        githubSearchQuery {
          queryString
        }
        viewerMeetingMember {
          teamMember {
            services {
              ...findIntegrationService_auth @relay(mask: false)
              ...usePersistIntegrationSearchQueryMutation_service @relay(mask: false)
            }
          }
        }
        ...GitHubScopingSearchHistoryToggle_meeting
        ...GitHubScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )

  const {queryString} = meeting.githubSearchQuery
  const services = meeting.viewerMeetingMember?.teamMember.services ?? []
  const searchQueries = findIntegrationService(services, 'github')?.searchQueries
  const defaultInput = searchQueries?.[0]?.queryString ?? SprintPokerDefaults.GITHUB_DEFAULT_QUERY

  return (
    <ScopingSearchBar>
      <GitHubScopingSearchHistoryToggle meetingRef={meeting} />
      <ScopingSearchInput
        placeholder={'Search GitHub issues...'}
        queryString={queryString}
        meetingId={meeting.id}
        linkedRecordName={'githubSearchQuery'}
        defaultInput={defaultInput}
        service={'github'}
      />
      <GitHubScopingSearchFilterToggle meetingRef={meeting} />
    </ScopingSearchBar>
  )
}

export default GitHubScopingSearchBar
