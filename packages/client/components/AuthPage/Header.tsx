/**
 * The brand header for the authentication homepages.
 *
 */
import styled from '@emotion/styled'
import React from 'react'
import {Link} from 'react-router-dom'
import {PALETTE} from '../../styles/paletteV3'
import parabolLogo from '../../styles/theme/images/brand/lockup_color_mark_white_type.svg'
import {GlobalBanner} from '../../types/constEnums'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

const HeaderContainer = styled('div')({
  alignItems: 'center',
  backgroundColor: PALETTE.GRAPE_700,
  color: '#FFFFFF',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  minHeight: 56,
  paddingTop: isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0,
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
