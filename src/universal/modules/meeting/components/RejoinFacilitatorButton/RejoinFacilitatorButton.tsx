import React from 'react'
import styled from 'react-emotion'
import FloatingActionButton from 'universal/components/FloatingActionButton'
import IconLabel from 'universal/components/IconLabel'

const RejoinButton = styled(FloatingActionButton)({
  bottom: '1.25rem',
  position: 'fixed',
  right: '4.5rem',
  zIndex: 400
})

interface Props {
  inSync: boolean
  onClick: (e: React.MouseEvent) => void
}

const RejoinFacilitatorButton = (props: Props) => {
  const {inSync, onClick} = props
  if (inSync) return null
  return (
    <RejoinButton onClick={onClick} palette='warm'>
      <IconLabel icon='person_pin_circle' label='Rejoin Facilitator' />
    </RejoinButton>
  )
}

export default RejoinFacilitatorButton
