import React, {useMemo} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {AssignFacilitator_newMeeting} from '../__generated__/AssignFacilitator_newMeeting.graphql'
import {AssignFacilitator_team} from '../__generated__/AssignFacilitator_team.graphql'
import withAtmosphere, {
  WithAtmosphereProps
} from '../decorators/withAtmosphere/withAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import lazyPreload from '../utils/lazyPreload'
import isDemoRoute from '../utils/isDemoRoute'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'

const AssignFacilitatorBlock = styled('div')({
  fontWeight: 700,
  padding: 8
})

const AssignFacilitatorToggle = styled('div')<{isActive: boolean, isReadOnly: boolean}>(({isActive, isReadOnly}) => ({
  alignItems: 'center',
  border: '1px solid transparent',
  borderColor: isActive ? PALETTE.BORDER_GRAY : undefined,
  borderRadius: 4,
  display: 'flex',
  color: isActive ? PALETTE.TEXT_MAIN : PALETTE.TEXT_GRAY,
  cursor: isReadOnly ? undefined : 'pointer',
  padding: '4px 8px',
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
  margin: '0 9px 0 4px',
  width: 30
}))

const Avatar = styled('img')({
  border: '1px solid #FFFFFF',
  borderRadius: 26,
  height: 26,
  width: 26
})

interface Props extends WithAtmosphereProps {
  newMeeting?: AssignFacilitator_newMeeting | null
  team: AssignFacilitator_team
}

const AssignFacilitatorMenuRoot = lazyPreload(() =>
  import(/* webpackChunkName: 'AssignFacilitatorMenuRoot' */
  './AssignFacilitatorMenuRoot')
)

const AssignFacilitator = (props: Props) => {
  const {newMeeting, team} = props
  if (!newMeeting) return null
  const {teamMembers} = team
  const {facilitatorUserId} = newMeeting
  const currentFacilitator = useMemo(
    () => teamMembers.find((teamMember) => teamMember.userId === facilitatorUserId),
    [facilitatorUserId, teamMembers]
  )
  const {togglePortal, menuProps, menuPortal, originRef, portalStatus} = useMenu<HTMLDivElement>(MenuPosition.UPPER_RIGHT)
  const isReadOnly = isDemoRoute() || teamMembers.length === 1
  const handleTogglePortal = () => {
    if (isReadOnly) return
    togglePortal()
  }
  return (
    <AssignFacilitatorBlock>
      <AssignFacilitatorToggle
        isActive={portalStatus === PortalStatus.Entering || portalStatus === PortalStatus.Entered}
        isReadOnly={isReadOnly}
        onMouseEnter={AssignFacilitatorMenuRoot.preload}
        onClick={handleTogglePortal}
        ref={originRef}
      >
        <AvatarBlock isConnected={currentFacilitator!.user.isConnected}>
          <Avatar alt='' src={currentFacilitator!.picture} />
        </AvatarBlock>
        <div>
          <Label>Faciltator</Label>
          <Subtext>{currentFacilitator!.preferredName}</Subtext>
        </div>
        {!isReadOnly && <StyledIcon>keyboard_arrow_down</StyledIcon>}
      </AssignFacilitatorToggle>
      {menuPortal(<AssignFacilitatorMenuRoot menuProps={menuProps} team={team} newMeeting={newMeeting} />)}
    </AssignFacilitatorBlock>
  )
}

export default createFragmentContainer(withAtmosphere(AssignFacilitator), {
  team: graphql`
    fragment AssignFacilitator_team on Team {
      ...AssignFacilitatorMenuRoot_team
      teamMembers(sortBy: "checkInOrder") {
        picture
        preferredName
        user {
          isConnected
        }
        userId
      }
    }
  `,
  newMeeting: graphql`
    fragment AssignFacilitator_newMeeting on NewMeeting {
      ...AssignFacilitatorMenuRoot_newMeeting
      facilitatorUserId
    }
  `
})
