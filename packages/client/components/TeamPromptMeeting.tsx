import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptMeeting_meeting$key} from '~/__generated__/TeamPromptMeeting_meeting.graphql'
import TeamPromptStructuredMeeting from './TeamPrompt/structured/TeamPromptStructuredMeeting'
import TeamPromptLegacyMeeting from './TeamPrompt/TeamPromptLegacyMeeting'

interface Props {
  meeting: TeamPromptMeeting_meeting$key
}

const TeamPromptMeeting = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMeeting_meeting on TeamPromptMeeting {
        templateId
        ...TeamPromptLegacyMeeting_meeting
        ...TeamPromptStructuredMeeting_meeting
      }
    `,
    meetingRef
  )
  if (meeting.templateId) {
    return <TeamPromptStructuredMeeting meetingRef={meeting} />
  }
  return <TeamPromptLegacyMeeting meeting={meeting} />
}

export default TeamPromptMeeting
