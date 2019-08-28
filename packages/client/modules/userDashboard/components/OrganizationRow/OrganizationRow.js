import PropTypes from 'prop-types'
import React from 'react'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import {PERSONAL, PRO, PRO_LABEL} from '../../../../utils/constants'
import {withRouter} from 'react-router-dom'
import plural from '../../../../utils/plural'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import Avatar from '../../../../components/Avatar/Avatar'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import TagPro from '../../../../components/Tag/TagPro'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import RowActions from '../../../../components/Row/RowActions'
import FlatButton from '../../../../components/FlatButton'
import SecondaryButton from '../../../../components/SecondaryButton'
import TagBlock from '../../../../components/Tag/TagBlock'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import Icon from '../../../../components/Icon'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'

// TODO: refactor this file to TS and use shared constants
// import {PALETTE} from '../../../../styles/paletteV2'
// import {Breakpoint} from '../../../../types/constEnums'

const SIDEBAR_LEFT = 800 // TODO: Use Breakpoint.SIDEBAR_LEFT
const PALETTE = {TEXT_LIGHT: '#82809A'}

const RowInner = styled('div')({
  display: 'block',
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap'
})

const OrgAvatar = styled('div')({
  cursor: 'pointer',
  display: 'none',
  width: '2.75rem',
  [`@media screen and (min-width: ${SIDEBAR_LEFT}px)`]: {
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

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT_LIGHT,
  fontSize: 18
})

const StyledRowInfo = styled(RowInfo)({
  paddingLeft: 0
})

const StyledFlatButton = styled(FlatButton)({
  height: 36,
  paddingLeft: 8,
  paddingRight: 8,
  [`@media screen and (min-width: ${SIDEBAR_LEFT}px)`]: {
    paddingLeft: 16,
    paddingRight: 16,
  }
})

const StyledRowInfoCopy = styled(RowInfoCopy)({
  alignItems: 'center',
  display: 'flex'
})

const OrganizationRow = (props) => {
  const {
    history,
    organization: {
      id: orgId,
      name,
      orgUserCount: {activeUserCount, inactiveUserCount},
      picture,
      tier
    }
  } = props
  const orgAvatar = picture || defaultOrgAvatar
  const onRowClick = () => history.push(`/me/organizations/${orgId}`)
  const totalUsers = activeUserCount + inactiveUserCount
  const showUpgradeCTA = tier === PERSONAL
  const upgradeCTALabel = (
    <span>
      {'Upgrade to '}
      <b>{PRO_LABEL}</b>
    </span>
  )
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip(
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
            <Name onClick={onRowClick}>
              {name}
            </Name>
            {tier === PRO && (
              <StyledTagBlock>
                <TagPro />
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
              {upgradeCTALabel}
            </StyledFlatButton>
          )}
          <StyledButton onClick={onRowClick} onMouseEnter={openTooltip} onMouseLeave={closeTooltip} ref={originRef}>
            <StyledIcon>settings</StyledIcon>
          </StyledButton>
          {tooltipPortal('Settings')}
        </RowActions>
      </RowInner>
    </Row>
  )
}

OrganizationRow.propTypes = {
  history: PropTypes.object.isRequired,
  organization: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    picture: PropTypes.string,
    tier: PropTypes.string.isRequired,
    orgUserCount: PropTypes.shape({
      activeUserCount: PropTypes.number.isRequired,
      inactiveUserCount: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
}

export default withRouter(OrganizationRow)
