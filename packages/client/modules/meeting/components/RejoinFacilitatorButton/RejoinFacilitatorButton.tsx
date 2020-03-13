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
  inSync: boolean
  onClick: (e: React.MouseEvent) => void
}

const RejoinFacilitatorButton = (props: Props) => {
  const {inSync, onClick} = props
  if (inSync) return null
  return (
    <RejoinButton onClick={onClick} palette='pink'>
      <IconLabel icon='person_pin_circle' label='Rejoin Facilitator' />
    </RejoinButton>
  )
}

export default RejoinFacilitatorButton
