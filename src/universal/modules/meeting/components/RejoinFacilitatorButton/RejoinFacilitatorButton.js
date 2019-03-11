import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import FloatingActionButton from 'universal/components/FloatingActionButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const RejoinButton = styled(FloatingActionButton)({
  bottom: '1.25rem',
  position: 'fixed',
  right: '4.5rem',
  zIndex: ui.ziRejoinFacilitatorButton
})

const RejoinFacilitatorButton = (props) => {
  const {onClickHandler} = props
  return (
    <RejoinButton onClick={onClickHandler} palette='warm'>
      <IconLabel icon='person_pin_circle' label='Rejoin Facilitator' />
    </RejoinButton>
  )
}

RejoinFacilitatorButton.propTypes = {
  onClickHandler: PropTypes.func
}

export default RejoinFacilitatorButton
