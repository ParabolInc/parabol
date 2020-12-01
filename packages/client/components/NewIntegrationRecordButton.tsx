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
  left: '74%',
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
  labelText: string
  className?: string
}

const NewIntegrationRecordButton = (props: Props) => {
  const {setIsEditing, labelText, className} = props
  return (
    <Button className={className} onClick={() => setIsEditing(true)} palette='blue'>
      <StyledIcon>{'add'}</StyledIcon>
      <StyledLabel>{labelText}</StyledLabel>
    </Button>
  )
}

export default NewIntegrationRecordButton
