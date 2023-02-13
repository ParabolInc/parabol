import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import React from 'react'
import DialogTitle from '../../../../components/DialogTitle'
import {PALETTE} from '../../../../styles/paletteV3'
import makeMaxWidthMediaQuery from '../../../../utils/makeMaxWidthMediaQuery'

const mobileBreakpoint = makeMaxWidthMediaQuery(420)

const Inner = styled('div')({
  margin: '0 auto',
  maxWidth: '608px',
  padding: '24px 16px 28px 16px',
  [mobileBreakpoint]: {
    padding: '24px 28px 28px 28px'
  }
})

const Title = styled(DialogTitle)({
  padding: '0 0 9px'
})

const InfoWrapper = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: '14px',
  fontWeight: 600,
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center'
})

const StyledInfoIcon = styled(Info)({
  color: PALETTE.SLATE_600,
  width: '18px',
  height: '18px',
  marginRight: '8px',
  ':hover': {
    cursor: 'pointer'
  }
})

const OrgAuthenticationHeader = () => {
  return (
    <Inner>
      <Title>SAML Single Sign-On</Title>
      <InfoWrapper>
        <StyledInfoIcon>{'info'}</StyledInfoIcon>
        Learn more about this feature
      </InfoWrapper>
    </Inner>
  )
}

export default OrgAuthenticationHeader
