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
  outline: 'none',
  padding: '8px 0'
})

const AddScaleValueLinkPlus = styled(Icon)({
  display: 'block',
  margin: '0 16px 0 16px'
})

interface Props {
  onClick: () => void
}

const AddTemplateScaleValue = (props: Props) => {
  const {onClick} = props
  return (
    <AddScaleValueLink palette='blue' onClick={onClick}>
      <AddScaleValueLinkPlus>add</AddScaleValueLinkPlus>
      <div>Add value</div>
    </AddScaleValueLink>
  )
}

export default AddTemplateScaleValue
