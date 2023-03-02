import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'
import {ColorBadge_reflection$key} from '~/__generated__/ColorBadge_reflection.graphql'

const DROP_SIZE = 32
const DROP_SIZE_HALF = DROP_SIZE / 2

const ColorDrop = styled('div')<{groupColor: string}>(({groupColor}) => ({
  backgroundColor: groupColor,
  borderRadius: 100,
  height: DROP_SIZE,
  left: -DROP_SIZE_HALF,
  position: 'absolute',
  top: -DROP_SIZE_HALF,
  width: DROP_SIZE
}))

const BadgeWrapper = styled('div')({
  borderRadius: '4px 0 0 0',
  height: DROP_SIZE_HALF,
  width: DROP_SIZE_HALF,
  left: 0,
  top: 0,
  overflow: 'hidden',
  position: 'absolute',
  zIndex: 4
})

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
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.LOWER_LEFT,
    {
      disabled: phaseType !== 'discuss'
    }
  )
  if (phaseType === 'reflect') return null
  return (
    <>
      <BadgeWrapper onMouseEnter={openTooltip} onMouseLeave={closeTooltip} ref={originRef}>
        <ColorDrop groupColor={groupColor} />
      </BadgeWrapper>
      {tooltipPortal(question)}
    </>
  )
}

export default ColorBadge
