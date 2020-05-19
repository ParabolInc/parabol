import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'
import {NewMeetingPhaseTypeEnum} from '~/types/graphql'
import {ColorBadge_reflection} from '~/__generated__/ColorBadge_reflection.graphql'
const ColorDrop = styled('div')<{groupColor: string}>(({groupColor}) => ({
  backgroundColor: groupColor,
  height: 32,
  width: 32
}))

const BadgeWrapper = styled('div')({
  borderTopLeftRadius: 30,
  borderBottomRightRadius: 100,
  height: 16,
  width: 16,
  left: 0,
  top: 0,
  overflow: 'hidden',
  position: 'absolute',
  zIndex: 4
})

interface Props {
  phaseType: NewMeetingPhaseTypeEnum
  reflection: ColorBadge_reflection
}

const ColorBadge = (props: Props) => {
  const {reflection, phaseType} = props
  const {phaseItem} = reflection
  const {question, groupColor} = phaseItem
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.LOWER_LEFT,
    {
      disabled: phaseType !== NewMeetingPhaseTypeEnum.discuss
    }
  )
  if (phaseType === NewMeetingPhaseTypeEnum.reflect) return null
  return (
    <>
      <BadgeWrapper onMouseEnter={openTooltip} onMouseLeave={closeTooltip} ref={originRef}>
        <ColorDrop groupColor={groupColor} />
      </BadgeWrapper>
      {tooltipPortal(question)}
    </>
  )
}

export default createFragmentContainer(ColorBadge, {
  reflection: graphql`
    fragment ColorBadge_reflection on RetroReflection {
      phaseItem {
        question
        groupColor
      }
    }
  `
})
