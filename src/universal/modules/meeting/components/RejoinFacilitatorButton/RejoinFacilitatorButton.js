import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const RejoinButton = styled(RaisedButton)({
  bottom: '1.25rem',
  position: 'fixed',
  right: '4.5rem',
  zIndex: ui.ziRejoinFacilitatorButton
})

const RejoinFacilitatorButton = (props) => {
  const {onClickHandler} = props
  return (
    <RejoinButton depth={2} onClick={onClickHandler} palette='warm'>
      <IconLabel icon='user' label='Rejoin Facilitator' />
    </RejoinButton>
  )
}

RejoinFacilitatorButton.propTypes = {
  onClickHandler: PropTypes.func
}

export default RejoinFacilitatorButton
