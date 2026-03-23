import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {JiraScopingSearchBar_meeting$key} from '../__generated__/JiraScopingSearchBar_meeting.graphql'
import {JiraScopingSearchBarLabel} from './JiraScopingSearchBarLabel'
import JiraScopingSearchFilterToggle from './JiraScopingSearchFilterToggle'
import JiraScopingSearchHistoryToggle from './JiraScopingSearchHistoryToggle'
import JiraScopingSearchInput from './JiraScopingSearchInput'

interface Props {
  meetingRef: JiraScopingSearchBar_meeting$key
}

const JiraScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchBar_meeting on PokerMeeting {
        ...JiraScopingSearchFilterToggle_meeting
        ...JiraScopingSearchHistoryToggle_meeting
        ...JiraScopingSearchInput_meeting
        ...JiraScopingSearchBarLabel_meeting
        id
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              atlassian {
                ...JiraScopingSearchBarLabel_integration @defer
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const {viewerMeetingMember} = meeting
  const integration = viewerMeetingMember?.teamMember.integrations.atlassian
  return (
    <JiraScopingSearchBarLabel meetingRef={meeting} integrationRef={integration!}>
      <JiraScopingSearchHistoryToggle meetingRef={meeting} />
      <JiraScopingSearchInput meetingRef={meeting} />
      <JiraScopingSearchFilterToggle meetingRef={meeting} />
    </JiraScopingSearchBarLabel>
  )
}

export default JiraScopingSearchBar
