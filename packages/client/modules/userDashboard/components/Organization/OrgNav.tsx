import styled from '@emotion/styled'
import {NavigateNext} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import {OrgNav_organization$key} from '../../../../__generated__/OrgNav_organization.graphql'
import {PALETTE} from '../../../../styles/paletteV3'

const Wrapper = styled('div')({
  display: 'flex',
  fontSize: 14,
  padding: '16px 0px',
  maxWidth: '100%',
  overflow: 'hidden'
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

const NavLabel = styled('span')<{isCurrent?: boolean}>(({isCurrent}) => ({
  fontWeight: isCurrent ? 600 : 400,
  textWrap: 'nowrap',
  '&:hover': {
    cursor: isCurrent ? 'default' : 'pointer'
  }
}))

const OrgLabel = styled(NavLabel)({
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

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
  const {name: orgName} = organization

  return (
    <Wrapper>
      <NavLabel onClick={() => history.push('/meetings')}>Dashboard</NavLabel>
      <StyledIcon>
        <NavigateNextIcon />
      </StyledIcon>
      <NavLabel onClick={() => history.push('/me/organizations')}>Organization</NavLabel>
      <StyledIcon>
        <NavigateNextIcon />
      </StyledIcon>
      <OrgLabel isCurrent>{orgName}</OrgLabel>
    </Wrapper>
  )
}

export default OrgNav
