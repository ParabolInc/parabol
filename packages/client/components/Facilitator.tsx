import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Facilitator_viewer} from '../__generated__/Facilitator_viewer.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import lazyPreload from '../utils/lazyPreload'
import isDemoRoute from '../utils/isDemoRoute'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'

const FacilitatorBlock = styled('div')({
  borderBottom: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  fontWeight: 700,
  marginBottom: 8,
  padding: '0 8px 8px'
})

const FacilitatorToggle = styled('div')<{isActive: boolean; isReadOnly: boolean}>(
  ({isActive, isReadOnly}) => ({
    alignItems: 'center',
    cursor: isReadOnly ? undefined : 'pointer',
    display: 'flex',
    // padding compensates for 8px grid, hanging elements
    // icons and other decorators can be on a 4px grid, anyway, per MD spec
    // total height = 40px like nav elements, and FacilitatorBlock and SidebarHeader (NewMeetingSidebar.tsx) add 8px gutter
    padding: '2px 4px',
    // StyledIcon when toggle isActive or not
    '& > i': {
      backgroundColor: isActive ? PALETTE.BACKGROUND_MAIN : undefined,
      color: isActive ? PALETTE.TEXT_MAIN : PALETTE.TEXT_GRAY
    },
    // StyledIcon when toggle hovered
    '&:hover > i': {
      backgroundColor: PALETTE.BACKGROUND_MAIN,
      color: PALETTE.TEXT_MAIN
    }
  })
)

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
  borderRadius: 32,
  height: 32,
  lineHeight: '32px',
  marginLeft: 'auto',
  textAlign: 'center',
  width: 32
})

const AvatarBlock = styled('div')<{isConnected: boolean | null}>(({isConnected}) => ({
  border: '2px solid',
  borderColor: isConnected ? PALETTE.TEXT_GREEN : PALETTE.TEXT_GRAY,
  borderRadius: 30,
  height: 30,
  marginLeft: 1,
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
  viewer: Facilitator_viewer
}

const FacilitatorMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'FacilitatorMenu' */
    './FacilitatorMenu'
  )
)

const Facilitator = (props: Props) => {
  const {viewer} = props
  const {id: userId, team} = viewer
  const {newMeeting, teamMembers} = team!
  const {facilitatorUserId, facilitator} = newMeeting!
  const {isConnected, picture, preferredName} = facilitator
  const {togglePortal, menuProps, menuPortal, originRef, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )
  const isReadOnly = isDemoRoute() || teamMembers.length === 1 || userId === facilitatorUserId
  const handleOnMouseEnter = () => !isReadOnly && FacilitatorMenu.preload()
  const handleOnClick = () => !isReadOnly && togglePortal()
  return (
    <FacilitatorBlock>
      <FacilitatorToggle
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
          <Label>Facilitator</Label>
          <Subtext>{preferredName}</Subtext>
        </div>
        {!isReadOnly && <StyledIcon>more_vert</StyledIcon>}
      </FacilitatorToggle>
      {menuPortal(<FacilitatorMenu menuProps={menuProps} viewer={viewer} />)}
    </FacilitatorBlock>
  )
}

export default createFragmentContainer(Facilitator, {
  viewer: graphql`
    fragment Facilitator_viewer on User {
      ...FacilitatorMenu_viewer
      id
      team(teamId: $teamId) {
        teamMembers(sortBy: "checkInOrder") {
          id
        }
        newMeeting {
          facilitatorUserId
          facilitator {
            isConnected
            picture
            preferredName
          }
        }
      }
    }
  `
})
