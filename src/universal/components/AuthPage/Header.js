/**
 * The brand header for the authentication homepages.
 *
 * @flow
 */
import React from 'react'
import styled from 'react-emotion'
import {Link} from 'react-router-dom'

import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import parabolLogo from 'universal/styles/theme/images/brand/logo.svg'

const HeaderContainer = styled('div')({
  alignItems: 'center',
  backgroundColor: appTheme.brand.primary.purple,
  color: ui.palette.white,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%'
})

const HeaderBrand = styled('div')({
  padding: '0.8rem 1rem 0.6rem'
})

export default () => (
  <HeaderContainer>
    <HeaderBrand>
      <Link to='/' title='Parabol Home'>
        <img src={parabolLogo} alt='' />
      </Link>
    </HeaderBrand>
  </HeaderContainer>
)
