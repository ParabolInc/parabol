import React, {forwardRef} from 'react'
import styled from 'react-emotion'
import IconLabel from 'universal/components/IconLabel'
import RaisedButton from 'universal/components/RaisedButton'

const StyledButton = styled(RaisedButton)({
  border: 0,
  height: '1.5rem',
  lineHeight: '1.5rem',
  padding: 0,
  width: '1.5rem'
})

interface Props {
  label: string
  onClick: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
}

const AddTaskButton = forwardRef((props: Props, ref: any) => {
  const {label, onClick, onMouseEnter} = props
  return (
    <StyledButton
      aria-label={`Add a Task set to ${label}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      palette='white'
      innerRef={ref}
    >
      <IconLabel icon='add' />
    </StyledButton>
  )
})

export default AddTaskButton
