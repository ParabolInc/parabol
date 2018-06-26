import PropTypes from 'prop-types'
import React from 'react'
import LinkButton from 'universal/components/LinkButton'
import IconLabel from 'universal/components/IconLabel'

const DashFilterToggle = (props) => {
  const {label, innerRef, onClick} = props
  return (
    <LinkButton
      aria-label={`Filter by ${label}`}
      onClick={onClick}
      palette='midGray'
      ref={innerRef}
    >
      <IconLabel icon='chevron-down' iconAfter label={label} />
    </LinkButton>
  )
}

DashFilterToggle.propTypes = {
  innerRef: PropTypes.func,
  label: PropTypes.string,
  onClick: PropTypes.func
}

export default DashFilterToggle
