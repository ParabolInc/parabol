import graphql from 'babel-plugin-relay/macro'
import plural from 'parabol-client/utils/plural'
import {makePokerStats_meeting} from 'parabol-client/__generated__/makePokerStats_meeting.graphql'
import {readInlineData} from 'react-relay'

const makePokerStats = (meetingRef: any) => {
  const meeting = readInlineData<makePokerStats_meeting>(
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
    {value: storyCount, label: plural(storyCount, 'Story', 'Stories')},
    {value: meetingMembersCount, label: 'Participants'},
    {value: '', label: ''}
  ]
}

export default makePokerStats
