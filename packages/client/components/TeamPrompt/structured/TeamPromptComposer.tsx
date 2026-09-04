import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptComposer_meeting$key} from '~/__generated__/TeamPromptComposer_meeting.graphql'

interface Props {
  meetingRef: TeamPromptComposer_meeting$key
}

const TeamPromptComposer = (props: Props) => {
  const {meetingRef} = props
  useFragment(
    graphql`
      fragment TeamPromptComposer_meeting on TeamPromptMeeting {
        id
      }
    `,
    meetingRef
  )
  return null
}

export default TeamPromptComposer
