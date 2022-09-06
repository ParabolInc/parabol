import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import parabolLogo from 'static/images/brand/mark-color.svg'
import PlainButton from '~/components/PlainButton/PlainButton'
import {PALETTE} from '~/styles/paletteV3'
import {NavSidebar} from '~/types/constEnums'

const Parabol = styled(PlainButton)({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: NavSidebar.FONT_SIZE,
  fontWeight: 600,
  lineHeight: NavSidebar.LINE_HEIGHT,
  padding: 8,
  userSelect: 'none',
  width: '100%'
})

const Label = styled('div')({
  paddingLeft: 8
})

const LeftDashParabol = () => {
  const {t} = useTranslation()

  return (
    <Parabol>
      <img crossOrigin='' alt='Parabol' src={parabolLogo} />
      <Label>{t('LeftDashParabol.Parabol')}</Label>
    </Parabol>
  )
}

export default LeftDashParabol
