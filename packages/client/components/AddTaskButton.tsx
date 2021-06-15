import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const StyledPlainButton = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: PALETTE.SKY_500,
  fontWeight: 600,
  fontSize: 14,
  margin: 'auto'
})

const AddTaskIcon = styled(Icon)({
  fontSize: 20,
  width: 20,
  height: 20,
  margin: '0 4px'
})

const AddTaskLabel = styled('div')({
  color: PALETTE.SKY_500
})

interface Props {
  onClick: () => void
  dataCy: string
}

const AddTaskButton = (props: Props) => {
  const {onClick, dataCy} = props

  return (
    <StyledPlainButton data-cy={`${dataCy}-add`} onClick={onClick}>
      <AddTaskIcon>task_alt</AddTaskIcon>
      <AddTaskLabel>Add a task</AddTaskLabel>
    </StyledPlainButton>
  )
}

export default AddTaskButton
