/**
 * The brand header for the authentication homepages.
 *
 */
import React from 'react'
import styled from '@emotion/styled'
import {Link} from 'react-router-dom'
import {PALETTE} from '../../styles/paletteV2'
import parabolLogo from '../../styles/theme/images/brand/lockup_color_mark_white_type.svg'

const HeaderContainer = styled('div')({
  alignItems: 'center',
  backgroundColor: PALETTE.PRIMARY_MAIN,
  color: '#FFFFFF',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  minHeight: 56,
  width: '100%'
})

const HeaderBrand = styled(Link)({
  display: 'block',
  padding: 8
})

const Img = styled('img')({
  display: 'block'
})

export default () => (
  <HeaderContainer>
    <HeaderBrand to='/' title='Parabol Home'>
      <Img crossOrigin='' src={parabolLogo} alt='' />
    </HeaderBrand>
  </HeaderContainer>
)
