import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {LinearScopingSearchBar_meeting$key} from '../__generated__/LinearScopingSearchBar_meeting.graphql'
import {SprintPokerDefaults} from '../types/constEnums'
import LinearScopingSearchFilterToggle from './LinearScopingSearchFilterToggle'
import ScopingSearchBar from './ScopingSearchBar'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  meetingRef: LinearScopingSearchBar_meeting$key
}

const LinearScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  graphql`
    fragment LinearScopingSearchBarLinearIntegration on LinearIntegration {
      linearSearchQueries {
        queryString
      }
    }
  `

  const meeting = useFragment(
    graphql`
      fragment LinearScopingSearchBar_meeting on PokerMeeting {
        id
        linearSearchQuery {
          queryString
        }
        viewerMeetingMember {
          teamMember {
            integrations {
              linear {
                ...LinearScopingSearchBarLinearIntegration @relay(mask: false)
              }
            }
          }
        }
        ...LinearScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )

  const {queryString} = meeting.linearSearchQuery

  const linearSearchQueries =
    meeting.viewerMeetingMember?.teamMember?.integrations?.linear?.linearSearchQueries
  const defaultInput =
    linearSearchQueries?.[0]?.queryString ?? SprintPokerDefaults.LINEAR_DEFAULT_QUERY

  return (
    <ScopingSearchBar>
      <ScopingSearchHistoryToggle />
      <ScopingSearchInput
        placeholder={'Search Linear issues...'}
        queryString={queryString}
        meetingId={meeting.id}
        linkedRecordName={'linearSearchQuery'}
        defaultInput={defaultInput}
        service={'linear'}
      />
      <LinearScopingSearchFilterToggle meetingRef={meeting} />
    </ScopingSearchBar>
  )
}

export default LinearScopingSearchBar
