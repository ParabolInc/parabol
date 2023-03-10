import styled from '@emotion/styled'
import {Settings as SettingsIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrganizationRow_organization$key} from '~/__generated__/OrganizationRow_organization.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import FlatButton from '../../../../components/FlatButton'
import Row from '../../../../components/Row/Row'
import RowActions from '../../../../components/Row/RowActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import SecondaryButton from '../../../../components/SecondaryButton'
import TagBlock from '../../../../components/Tag/TagBlock'
import TierTag from '../../../../components/Tag/TierTag'
import {MenuPosition} from '../../../../hooks/useCoords'
import useRouter from '../../../../hooks/useRouter'
import useTooltip from '../../../../hooks/useTooltip'
import {PALETTE} from '../../../../styles/paletteV3'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import {Breakpoint} from '../../../../types/constEnums'
import plural from '../../../../utils/plural'

const RowInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap'
})

const OrgAvatar = styled('div')({
  cursor: 'pointer',
  display: 'none',
  width: '2.75rem',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    display: 'block',
    marginRight: 16
  }
})

const Name = styled(RowInfoHeading)({
  cursor: 'pointer'
})

const StyledTagBlock = styled(TagBlock)({
  display: 'block'
})

const StyledButton = styled(SecondaryButton)({
  height: 36,
  marginLeft: 8,
  padding: 0,
  width: 36
})

const StyledIcon = styled('div')({
  color: PALETTE.SLATE_600,
  height: 18,
  width: 18,
  svg: {
    fontSize: 18
  }
})

const StyledRowInfo = styled(RowInfo)({
  paddingLeft: 0
})

const StyledFlatButton = styled(FlatButton)({
  height: 36,
  paddingLeft: 8,
  paddingRight: 8,
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    paddingLeft: 16,
    paddingRight: 16
  }
})

const StyledRowInfoCopy = styled(RowInfoCopy)({
  alignItems: 'center',
  display: 'flex'
})

interface Props {
  organization: OrganizationRow_organization$key
}

const OrganizationRow = (props: Props) => {
  const {organization: organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrganizationRow_organization on Organization {
        id
        name
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
        picture
        tier
      }
    `,
    organizationRef
  )
  const {history} = useRouter()
  const {
    id: orgId,
    name,
    orgUserCount: {activeUserCount, inactiveUserCount},
    picture,
    tier
  } = organization
  const orgAvatar = picture || defaultOrgAvatar
  const onRowClick = () => {
    closeTooltip()
    history.push(`/me/organizations/${orgId}`)
  }
  const totalUsers = activeUserCount + inactiveUserCount
  const showUpgradeCTA = tier === 'starter'
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <Row>
      <OrgAvatar onClick={onRowClick}>
        <Avatar size={44} picture={orgAvatar} />
      </OrgAvatar>
      <RowInner>
        <StyledRowInfo>
          <RowInfoHeader>
            <Name onClick={onRowClick}>{name}</Name>
            {tier !== 'starter' && (
              <StyledTagBlock>
                <TierTag tier={tier} />
              </StyledTagBlock>
            )}
          </RowInfoHeader>
          <StyledRowInfoCopy>
            {`${totalUsers} ${plural(totalUsers, 'User')} (${activeUserCount} Active)`}
          </StyledRowInfoCopy>
        </StyledRowInfo>
        <RowActions>
          {showUpgradeCTA && (
            <StyledFlatButton onClick={onRowClick} palette={'blue'}>
              {'Upgrade'}
            </StyledFlatButton>
          )}
          <StyledButton
            onClick={onRowClick}
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            ref={originRef}
          >
            <StyledIcon>
              <SettingsIcon />
            </StyledIcon>
          </StyledButton>
          {tooltipPortal('Settings')}
        </RowActions>
      </RowInner>
    </Row>
  )
}

export default OrganizationRow
