import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptTemplateHeader_meeting$key} from '~/__generated__/TeamPromptTemplateHeader_meeting.graphql'

interface Props {
  meetingRef: TeamPromptTemplateHeader_meeting$key
}

const TeamPromptTemplateHeader = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptTemplateHeader_meeting on TeamPromptMeeting {
        template {
          name
        }
        prompts {
          id
        }
      }
    `,
    meetingRef
  )
  const {template, prompts} = meeting
  const isPlural = prompts.length > 1
  return (
    <div className='mx-[7%] my-4 flex flex-col items-center text-center'>
      <h1 className='m-0 font-normal text-[20px] leading-8'>{template?.name}</h1>
      <div className='text-[12px] text-fg-muted'>
        {isPlural
          ? 'Your responses are visible to the team once you share them'
          : 'Your response is visible to the team once you share it'}
      </div>
    </div>
  )
}

export default TeamPromptTemplateHeader
