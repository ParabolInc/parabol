import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptMeetingPrompt_meeting$key} from '~/__generated__/TeamPromptMeetingPrompt_meeting.graphql'

interface Props {
  meetingRef: TeamPromptMeetingPrompt_meeting$key
}

const TeamPromptMeetingPrompt = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMeetingPrompt_meeting on TeamPromptMeeting {
        prompts {
          id
          question
        }
      }
    `,
    meetingRef
  )
  const {prompts} = meeting
  return (
    <h1 className='mx-[7%] my-4 flex cursor-default items-center justify-center text-center font-normal text-[20px] leading-8'>
      {prompts[0]?.question}
    </h1>
  )
}

export default TeamPromptMeetingPrompt
