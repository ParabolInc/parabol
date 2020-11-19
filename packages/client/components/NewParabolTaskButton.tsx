import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {ZIndex} from '~/types/constEnums'
import FloatingActionButton from './FloatingActionButton'

const Button = styled(FloatingActionButton)({
  color: '#fff',
  padding: '10px 12px',
  width: '150px',
  top: '85%',
  left: '174%',
  position: 'absolute',
  zIndex: ZIndex.FAB
})

const StyledIcon = styled(Icon)({
  paddingRight: 8
})

const StyledLabel = styled('div')({
  fontSize: 16,
  fontWeight: 600
})

interface Props {
  setIsEditing: (isEditing: boolean) => void
}

const NewParabolTaskButton = (props: Props) => {
  const {setIsEditing} = props
  return (
    <Button onClick={() => setIsEditing(true)} palette='blue'>
      <StyledIcon>{'add'}</StyledIcon>
      <StyledLabel>{'New Task'}</StyledLabel>
    </Button>
  )
}

export default NewParabolTaskButton
