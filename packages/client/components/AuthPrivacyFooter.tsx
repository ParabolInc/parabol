import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'

const color = PALETTE.LINK_BLUE

const Link = styled('a')({
  color,
  marginTop: '1rem',
  textAlign: 'center',
  ':hover,:focus,:active': {
    color,
    textDecoration: 'underline'
  }
})

const FooterCopy = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 11,
  lineHeight: '24px',
  marginTop: 8,
  textAlign: 'center'
})

const AuthPrivacyFooter = () => (
  <FooterCopy>
    {'By creating an account, you agree to our '}
    <Link
      href='https://www.parabol.co/privacy'
      rel='noopener noreferrer'
      target='_blank'
      title='Privacy Policy'
    >
      {'Privacy Policy'}
    </Link>
    .
  </FooterCopy>
)

export default AuthPrivacyFooter
