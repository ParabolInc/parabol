import styled from '@emotion/styled'
import React from 'react'
import Icon from '../../../components/Icon'
import LinkButton from '../../../components/LinkButton'

const AddScaleValueLink = styled(LinkButton)({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-start',
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  marginBottom: 16,
  outline: 'none',
  padding: '8px 0'
})

const AddScaleValueLinkPlus = styled(Icon)({
  display: 'block',
  margin: '0 16px 0 16px'
})

interface Props {
  setIsEditing: (isEditing: boolean) => void
}

const AddTemplateScaleValue = (props: Props) => {
  const {setIsEditing} = props

  return (
    <AddScaleValueLink palette='blue' onClick={() => setIsEditing(true)}>
      <AddScaleValueLinkPlus>add</AddScaleValueLinkPlus>
      <div>Add value</div>
    </AddScaleValueLink>
  )
}

export default AddTemplateScaleValue
