import PropTypes from 'prop-types'
import React from 'react'
import Button from 'universal/components/Button'

const AcknowledgeButton = (props) => (
  <Button
    aria-label={props['aria-label']}
    buttonSize='small'
    colorPalette='gray'
    icon='check'
    isBlock
    type='submit'
    onClick={props.onClick}
    waiting={props.waiting}
  />
)

AcknowledgeButton.propTypes = {
  'aria-label': PropTypes.string,
  onClick: PropTypes.func,
  waiting: PropTypes.bool
}

export default AcknowledgeButton
