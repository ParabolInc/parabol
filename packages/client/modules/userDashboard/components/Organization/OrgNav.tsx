import styled from '@emotion/styled'
import {NavigateNext} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  fontSize: 13,
  // justifyContent: 'center',
  lineHeight: '20px',
  border: '2px solid red',
  width: '100%'
})

const StyledIcon = styled('div')({
  height: ICON_SIZE.MD18,
  color: PALETTE.SLATE_700,
  opacity: 0.5
})

const NavItemLabel = styled('span')({
  display: 'inline-block',
  verticalAlign: 'middle'
})

const OrgNav = () => {
  return (
    <Wrapper>
      <NavItemLabel>Dashboard</NavItemLabel>
      <StyledIcon>
        <NavigateNext />
      </StyledIcon>
      <NavItemLabel>Organization</NavItemLabel>
      <StyledIcon>
        <NavigateNext />
      </StyledIcon>
      <NavItemLabel>{`Hardcoded's Org`}</NavItemLabel>
    </Wrapper>
  )
}

export default OrgNav
