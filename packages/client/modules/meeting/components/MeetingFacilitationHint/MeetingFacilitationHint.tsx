import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import Ellipsis from '../../../../components/Ellipsis/Ellipsis'
import {PALETTE} from '../../../../styles/paletteV3'

const Hint = styled('div')({
  color: PALETTE.SLATE_600,
  display: 'inline-block',
  fontSize: 13,
  lineHeight: '20px',
  textAlign: 'center'
})
const MeetingFacilitationHint = (props) => {
  const {children} = props

  const {t} = useTranslation()

  return (
    <Hint>
      {t('MeetingFacilitationHint.(')}
      {children}
      <Ellipsis />
      {t('MeetingFacilitationHint.)')}
    </Hint>
  )
}

export default MeetingFacilitationHint
