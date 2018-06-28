import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'

const StyledButton = styled(RaisedButton)({
  border: 0,
  height: '1.5rem',
  lineHeight: '1.5rem',
  padding: 0,
  width: '1.5rem'
})

const AddTaskButton = (props) => {
  const {label, onClick} = props
  return (
    <StyledButton aria-label={`Add a Task set to ${label}`} onClick={onClick} palette='white'>
      <IconLabel name='plus' />
    </StyledButton>
  )
}

AddTaskButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func
}

export default AddTaskButton
