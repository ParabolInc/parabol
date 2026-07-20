import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'
import type {ColorBadge_reflection$key} from '~/__generated__/ColorBadge_reflection.graphql'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'

interface Props {
  phaseType: NewMeetingPhaseTypeEnum
  reflection: ColorBadge_reflection$key
}

const ColorBadge = (props: Props) => {
  const {reflection: reflectionRef, phaseType} = props
  const reflection = useFragment(
    graphql`
      fragment ColorBadge_reflection on RetroReflection {
        prompt {
          question
          groupColor
        }
      }
    `,
    reflectionRef
  )
  const {prompt} = reflection
  const {question, groupColor} = prompt
  if (phaseType === 'reflect') return null
  return (
    <Tooltip disableHoverableContent={phaseType !== 'discuss'}>
      <TooltipTrigger asChild>
        {/* a 32px drop clipped by a 16px wrapper so only the top-left quadrant shows */}
        <div className='absolute top-0 left-0 z-4 h-4 w-4 overflow-hidden rounded-tl'>
          <div
            className='-top-4 -left-4 absolute h-8 w-8 rounded-[100px]'
            style={{backgroundColor: groupColor}}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>{question}</TooltipContent>
    </Tooltip>
  )
}

export default ColorBadge
