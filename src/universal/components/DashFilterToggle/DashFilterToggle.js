import PropTypes from 'prop-types'
import React from 'react'
import Button from 'universal/components/Button'

const DashFilterToggle = (props) => {
  const {label, innerRef, onClick} = props
  return (
    <Button
      aria-label={`Filter by ${label}`}
      buttonSize='small'
      buttonStyle='link'
      colorPalette='midGray'
      icon='chevron-down'
      iconPlacement='right'
      label={label}
      onClick={onClick}
      ref={innerRef}
      title={`Filter by ${label}`}
    />
  )
}

DashFilterToggle.propTypes = {
  innerRef: PropTypes.func,
  label: PropTypes.string,
  onClick: PropTypes.func
}

export default DashFilterToggle
