import graphql from 'babel-plugin-relay/macro'
import plural from 'parabol-client/utils/plural'
import {makePokerStats_meeting$key} from 'parabol-client/__generated__/makePokerStats_meeting.graphql'
import {readInlineData} from 'react-relay'

const makePokerStats = (meetingRef: makePokerStats_meeting$key) => {
  const meeting = readInlineData(
    graphql`
      fragment makePokerStats_meeting on PokerMeeting @inline {
        meetingMembers {
          id
        }
        storyCount
      }
    `,
    meetingRef
  )

  const {meetingMembers, storyCount} = meeting
  const meetingMembersCount = meetingMembers.length
  return [
    {value: '', label: ''},
    {value: storyCount, label: plural(storyCount, 'Completed Story', 'Completed Stories')},
    {value: meetingMembersCount, label: 'Participants'},
    {value: '', label: ''}
  ]
}

export default makePokerStats
