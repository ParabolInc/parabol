import PropTypes from 'prop-types'
import React from 'react'
import IconButton from 'universal/components/IconButton/IconButton'
import styled from 'react-emotion'

const ButtonBlock = styled('div')({padding: '0 0 0 1rem'})

const WelcomeSubmitButton = (props) => {
  const ariaLabel = 'Tap to submit and continue'
  return (
    <ButtonBlock>
      <IconButton
        aria-label={ariaLabel}
        disabled={props.disabled}
        iconName='check-circle'
        iconSize='2x'
        title={ariaLabel}
        type='submit'
      />
    </ButtonBlock>
  )
}

WelcomeSubmitButton.propTypes = {disabled: PropTypes.bool}

export default WelcomeSubmitButton
