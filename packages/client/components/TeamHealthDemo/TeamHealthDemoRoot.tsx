import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {TeamHealthDemoRootQuery} from '~/__generated__/TeamHealthDemoRootQuery.graphql'
import {TeamHealthDemo} from '../../modules/demo/teamHealthDemoIds'
import TeamHealthMeeting from '../TeamHealthMeeting'

const query = graphql`
  query TeamHealthDemoRootQuery($meetingId: ID!) @raw_response_type {
    viewer {
      meeting(meetingId: $meetingId) {
        ...TeamHealthMeeting_meeting @alias
      }
    }
  }
`

const TeamHealthDemoRoot = () => {
  const data = useLazyLoadQuery<TeamHealthDemoRootQuery>(query, {
    meetingId: TeamHealthDemo.MEETING_ID
  })
  const meeting = data.viewer.meeting?.TeamHealthMeeting_meeting
  if (!meeting) return null
  return <TeamHealthMeeting meeting={meeting} />
}

export default TeamHealthDemoRoot
