import styled from '@emotion/styled'
import {NavigateNext} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {OrgNav_organization$key} from '../../../../__generated__/OrgNav_organization.graphql'

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

type Props = {
  organizationRef: OrgNav_organization$key
}

const OrgNav = (props: Props) => {
  const {organizationRef} = props
  const history = useHistory()
  const organization = useFragment(
    graphql`
      fragment OrgNav_organization on Organization {
        name
      }
    `,
    organizationRef
  )
  const {name} = organization

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
      <NavItemLabel isBold>{`${name}'s Org`}</NavItemLabel>
    </Wrapper>
  )
}

export default OrgNav
