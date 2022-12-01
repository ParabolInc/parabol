import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import React from 'react'
import {ZIndex} from '~/types/constEnums'
import FloatingActionButton from './FloatingActionButton'

const Button = styled(FloatingActionButton)({
  color: '#fff',
  padding: '10px 12px',
  minWidth: '150px',
  bottom: 16,
  right: 16,
  position: 'absolute',
  zIndex: ZIndex.FAB
})

const StyledIcon = styled(Add)({
  marginRight: 8
})

const StyledLabel = styled('div')({
  fontSize: 16,
  fontWeight: 600
})

interface Props {
  labelText: string
  onClick: (e: React.MouseEvent) => void
}

const NewIntegrationRecordButton = (props: Props) => {
  const {labelText, onClick} = props
  return (
    <Button onClick={onClick} palette='blue'>
      <StyledIcon />
      <StyledLabel>{labelText}</StyledLabel>
    </Button>
  )
}

export default NewIntegrationRecordButton
