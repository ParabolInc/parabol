import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {AssignFacilitator_team} from '../__generated__/AssignFacilitator_team.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import lazyPreload from '../utils/lazyPreload'
import isDemoRoute from '../utils/isDemoRoute'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'

const AssignFacilitatorBlock = styled('div')({
  borderBottom: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  fontWeight: 700,
  marginBottom: 8,
  padding: '0 7px 8px'
})

const AssignFacilitatorToggle = styled('div')<{isActive: boolean, isReadOnly: boolean}>(({isActive, isReadOnly}) => ({
  alignItems: 'center',
  border: '1px solid transparent',
  borderColor: isActive ? PALETTE.BORDER_GRAY : undefined,
  borderRadius: 4,
  display: 'flex',
  color: isActive ? PALETTE.TEXT_MAIN : PALETTE.TEXT_GRAY,
  cursor: isReadOnly ? undefined : 'pointer',
  padding: '4px 8px 4px 5px',
  '&:hover': {
    borderColor: isReadOnly ? undefined : PALETTE.BORDER_GRAY,
    color: PALETTE.TEXT_MAIN
  }
}))

const Label = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px'
})

const Subtext = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 11,
  fontWeight: 400,
  lineHeight: '16px'
})

const StyledIcon = styled(Icon)({
  color: 'inherit',
  marginLeft: 'auto'
})

const AvatarBlock = styled('div')<{isConnected: boolean | null}>(({isConnected}) => ({
  border: '2px solid',
  borderColor: isConnected ? PALETTE.TEXT_GREEN : PALETTE.TEXT_GRAY,
  borderRadius: 30,
  height: 30,
  marginRight: 13,
  width: 30
}))

const Avatar = styled('img')({
  border: '1px solid #FFFFFF',
  borderRadius: 26,
  height: 26,
  width: 26
})

interface Props {
  team: AssignFacilitator_team
}

const AssignFacilitatorMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'AssignFacilitatorMenu' */
  './AssignFacilitatorMenu')
)

const AssignFacilitator = (props: Props) => {
  const {team} = props
  const {newMeeting, teamMembers} = team
  const {facilitator} = newMeeting!
  const {picture, preferredName, user: {isConnected}} = facilitator
  const {togglePortal, menuProps, menuPortal, originRef, portalStatus} = useMenu<HTMLDivElement>(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const isReadOnly = isDemoRoute() || teamMembers.length === 1
  const handleOnMouseEnter = () => !isReadOnly && AssignFacilitatorMenu.preload()
  const handleOnClick = () => !isReadOnly && togglePortal()
  return (
    <AssignFacilitatorBlock>
      <AssignFacilitatorToggle
        isActive={portalStatus === PortalStatus.Entering || portalStatus === PortalStatus.Entered}
        isReadOnly={isReadOnly}
        onClick={handleOnClick}
        onMouseEnter={handleOnMouseEnter}
        ref={originRef}
      >
        <AvatarBlock isConnected={isConnected}>
          <Avatar alt='' src={picture} />
        </AvatarBlock>
        <div>
          <Label>Faciltator</Label>
          <Subtext>{preferredName}</Subtext>
        </div>
        {!isReadOnly && <StyledIcon>keyboard_arrow_down</StyledIcon>}
      </AssignFacilitatorToggle>
      {menuPortal(<AssignFacilitatorMenu menuProps={menuProps} team={team} />)}
    </AssignFacilitatorBlock>
  )
}

export default createFragmentContainer(AssignFacilitator, {
  team: graphql`
    fragment AssignFacilitator_team on Team {
      ...AssignFacilitatorMenu_team
      teamMembers(sortBy: "checkInOrder") {
        id
      }
      newMeeting {
        facilitator {
          picture
          preferredName
          user {
            isConnected
          }
        }
      }
    }
  `
})
