import styled from '@emotion/styled'
import {NavigateNext} from '@mui/icons-material'
import React from 'react'
import {useHistory} from 'react-router'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  fontSize: 13,
  lineHeight: '20px',
  padding: '16px 0px',
  width: '100%'
})

const StyledIcon = styled('div')({
  display: 'flex',
  alignItems: 'center',
  height: ICON_SIZE.MD18,
  color: PALETTE.SLATE_700,
  opacity: 0.5
})

const NavItemLabel = styled('span')<{isBold?: boolean}>(({isBold}) => ({
  display: 'inline-block',
  verticalAlign: 'middle',
  fontWeight: isBold ? 600 : 400,
  '&:hover': {
    cursor: 'pointer'
  }
}))

const OrgNav = () => {
  const history = useHistory()
  return (
    <Wrapper>
      <NavItemLabel onClick={() => history.push('/meetings')}>Dashboard</NavItemLabel>
      <StyledIcon>
        <NavigateNext />
      </StyledIcon>
      <NavItemLabel onClick={() => history.push('/me/organizations')}>Organization</NavItemLabel>
      <StyledIcon>
        <NavigateNext />
      </StyledIcon>
      <NavItemLabel isBold>{`Hardcoded's Org`}</NavItemLabel>
    </Wrapper>
  )
}

export default OrgNav
