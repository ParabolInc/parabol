import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '~/styles/paletteV3'
import LinkButton from '../../../components/LinkButton'

const AddScaleValueLink = styled(LinkButton)({
  alignItems: 'center',
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  display: 'flex',
  justifyContent: 'flex-start',
  fontSize: 14, // match the scale item font-size
  lineHeight: '24px',
  margin: 0,
  outline: 'none',
  padding: '8px 0',
  ':hover': {
    backgroundColor: PALETTE.SLATE_100
  }
})

const AddScaleValueLinkPlus = styled(Add)({
  display: 'block',
  margin: '0 16px 0 16px'
})

interface Props {
  onClick: () => void
}

const AddTemplateScaleValue = (props: Props) => {
  const {onClick} = props

  const {t} = useTranslation()

  return (
    <AddScaleValueLink palette='blue' onClick={onClick}>
      <AddScaleValueLinkPlus />
      <div>{t('AddTemplateScaleValue.AddValue')}</div>
    </AddScaleValueLink>
  )
}

export default AddTemplateScaleValue
