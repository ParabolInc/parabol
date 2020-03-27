import styled from '@emotion/styled'
import React from 'react'
import FloatingActionButton from '../../../../components/FloatingActionButton'
import IconLabel from '../../../../components/IconLabel'
import {ZIndex} from '../../../../types/constEnums'

const RejoinButton = styled(FloatingActionButton)({
  bottom: 16,
  position: 'fixed',
  right: 72,
  zIndex: ZIndex.FAB
})

interface Props {
  endedAt: string | null
  inSync: boolean
  onClick: (e: React.MouseEvent) => void
}

const RejoinFacilitatorButton = (props: Props) => {
  const {endedAt, inSync, onClick} = props
  if (inSync || endedAt) return null
  return (
    <RejoinButton onClick={onClick} palette='pink'>
      <IconLabel icon='person_pin_circle' label='Rejoin Facilitator' />
    </RejoinButton>
  )
}

export default RejoinFacilitatorButton
