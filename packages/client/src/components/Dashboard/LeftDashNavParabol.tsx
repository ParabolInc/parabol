import styled from '@emotion/styled'
import PlainButton from 'parabol-client/src/components/PlainButton/PlainButton'
import React from 'react'
import {PALETTE} from 'parabol-client/src/styles/paletteV2'
import {NavSidebar} from 'parabol-client/src/types/constEnums'
import parabolLogo from '../../../../../static/images/brand/mark-color.svg'

const Parabol = styled(PlainButton)({
  alignItems: 'center',
  color: PALETTE.TEXT_MAIN,
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
  return (
    <Parabol>
      <img crossOrigin='' alt='Parabol' src={parabolLogo} />
      <Label>{'PARABOL'}</Label>
    </Parabol>
  )
}

export default LeftDashParabol
