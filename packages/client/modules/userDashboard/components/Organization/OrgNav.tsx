import styled from '@emotion/styled'
import {NavigateNext} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import {PALETTE} from '../../../../styles/paletteV3'
import {ElementWidth} from '../../../../types/constEnums'
import {OrgNav_organization$key} from '../../../../__generated__/OrgNav_organization.graphql'

const Wrapper = styled('div')({
  display: 'flex',
  fontSize: 14,
  padding: '16px 0px',
  maxWidth: ElementWidth.PANEL_WIDTH
})

const StyledIcon = styled('div')({
  display: 'flex',
  alignItems: 'center',
  opacity: 0.5
})

const NavigateNextIcon = styled(NavigateNext)({
  height: 18,
  color: PALETTE.SLATE_900
})

const NavItemLabel = styled('span')<{isCurrent?: boolean}>(({isCurrent}) => ({
  fontWeight: isCurrent ? 600 : 400,
  '&:hover': {
    cursor: isCurrent ? 'default' : 'pointer'
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
        <NavigateNextIcon />
      </StyledIcon>
      <NavItemLabel onClick={() => history.push('/me/organizations')}>Organization</NavItemLabel>
      <StyledIcon>
        <NavigateNextIcon />
      </StyledIcon>
      <NavItemLabel isCurrent>{`${name}'s Org`}</NavItemLabel>
    </Wrapper>
  )
}

export default OrgNav
