import styled from '@emotion/styled'
import {MoreVert} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {Facilitator_meeting$key} from '~/__generated__/Facilitator_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import {PALETTE} from '../styles/paletteV3'
import isDemoRoute from '../utils/isDemoRoute'
import lazyPreload from '../utils/lazyPreload'

const FacilitatorBlock = styled('div')({
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
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
    span: {
      backgroundColor: isActive ? PALETTE.SLATE_200 : undefined,
      color: isActive ? PALETTE.SLATE_700 : PALETTE.SLATE_600
    },
    // StyledIcon when toggle hovered
    '&:hover > span': {
      backgroundColor: PALETTE.SLATE_200,
      color: PALETTE.SLATE_700
    }
  })
)

const Label = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px'
})

const Subtext = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '16px',
  overflowWrap: 'break-word',
  width: 165
})

const StyledIcon = styled('span')({
  borderRadius: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  height: 32,
  marginLeft: 'auto',
  width: 32
})

const AvatarBlock = styled('div')<{isConnected: boolean | null}>(({isConnected}) => ({
  border: '2px solid',
  borderColor: isConnected ? PALETTE.JADE_400 : PALETTE.SLATE_600,
  borderRadius: 30,
  flexShrink: 0,
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
  meetingRef: Facilitator_meeting$key
}

const FacilitatorMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'FacilitatorMenu' */
      './FacilitatorMenu'
    )
)

const Facilitator = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment Facilitator_meeting on NewMeeting {
        ...FacilitatorMenu_meeting
        endedAt
        facilitatorUserId
        meetingMembers {
          user {
            id
            isConnected
          }
        }
        facilitator {
          picture
          preferredName
          user {
            isConnected
          }
        }
      }
    `,
    meetingRef
  )
  const {endedAt, facilitatorUserId, meetingMembers, facilitator} = meeting
  const connectedMemberIds = meetingMembers
    .filter(({user}) => user.isConnected)
    .map(({user}) => user.id)
  const {user, picture, preferredName} = facilitator
  // https://sentry.io/share/issue/efef01c3e7934ab981ed5c80ef2d64c8/
  const isConnected = user?.isConnected ?? false
  const {togglePortal, menuProps, menuPortal, originRef, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isReadOnly =
    isDemoRoute() ||
    (viewerId === facilitatorUserId &&
      connectedMemberIds.length === 1 &&
      connectedMemberIds[0] === viewerId) ||
    !!endedAt
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
        {!isReadOnly && (
          <StyledIcon>
            <MoreVert />
          </StyledIcon>
        )}
      </FacilitatorToggle>
      {menuPortal(<FacilitatorMenu menuProps={menuProps} meeting={meeting} />)}
    </FacilitatorBlock>
  )
}

export default Facilitator
