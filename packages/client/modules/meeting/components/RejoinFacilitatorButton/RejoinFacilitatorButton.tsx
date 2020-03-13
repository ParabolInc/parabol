import React from 'react'
import styled from '@emotion/styled'
import FloatingActionButton from '../../../../components/FloatingActionButton'
import IconLabel from '../../../../components/IconLabel'
import {ZIndex} from '../../../../types/constEnums'
import {NewMeetingPhaseTypeEnum} from 'types/graphql'

const RejoinButton = styled(FloatingActionButton)<{isDiscuss: boolean}>(({isDiscuss}) => ({
  bottom: isDiscuss ? 72 : 16,
  position: 'fixed',
  right: isDiscuss ? 16 : 72,
  zIndex: ZIndex.FAB
}))

interface Props {
  localPhaseType?: NewMeetingPhaseTypeEnum
  inSync: boolean
  onClick: (e: React.MouseEvent) => void
}

const RejoinFacilitatorButton = (props: Props) => {
  const {inSync, localPhaseType, onClick} = props
  if (inSync) return null
  const isDiscuss = localPhaseType === NewMeetingPhaseTypeEnum.discuss
  return (
    <RejoinButton isDiscuss={isDiscuss} onClick={onClick} palette='pink'>
      <IconLabel icon='person_pin_circle' label='Rejoin Facilitator' />
    </RejoinButton>
  )
}

export default RejoinFacilitatorButton
