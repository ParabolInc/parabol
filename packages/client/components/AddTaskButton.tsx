import styled from '@emotion/styled'
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

const StyledPlainButton = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: PALETTE.SKY_500,
  fontWeight: 600,
  fontSize: 14,
  margin: '0 8px',
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  },
  transition: 'color 0.1s ease'
})

const AddTaskIcon = styled(TaskAltOutlined)({
  width: 20,
  height: 20,
  margin: '0 4px 0 0'
})

const AddTaskLabel = styled('div')({
  color: 'inherit'
})

interface Props {
  onClick: () => void
  dataCy: string
  disabled?: boolean
}

const AddTaskButton = (props: Props) => {
  const {onClick, dataCy, disabled} = props

  return (
    <StyledPlainButton data-cy={`${dataCy}-add`} onClick={onClick} disabled={disabled}>
      <AddTaskIcon />
      <AddTaskLabel>Add a task</AddTaskLabel>
    </StyledPlainButton>
  )
}

export default AddTaskButton
