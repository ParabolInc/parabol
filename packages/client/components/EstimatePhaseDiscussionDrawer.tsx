import styled from '@emotion/styled'
import React, {useRef} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {desktopSidebarShadow} from '~/styles/elevation'
import {EstimatePhaseDiscussionDrawer_meeting} from '~/__generated__/EstimatePhaseDiscussionDrawer_meeting.graphql'
import {DiscussionThreadEnum, MeetingControlBarEnum, ZIndex} from '../types/constEnums'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import {PALETTE} from '~/styles/paletteV2'
import LabelHeading from './LabelHeading/LabelHeading'
import Avatar from './Avatar/Avatar'
import SidebarToggle from './SidebarToggle'
import {DECELERATE} from '~/styles/animation'

const Drawer = styled('div')<{isDesktop: boolean; isOpen: boolean}>(({isDesktop, isOpen}) => ({
  boxShadow: isDesktop ? desktopSidebarShadow : undefined,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  position: isDesktop ? 'fixed' : 'static',
  bottom: 0,
  top: 0,
  right: isDesktop ? 0 : undefined,
  transition: `all 200ms ${DECELERATE}`,
  userSelect: 'none',
  width: isOpen || !isDesktop ? DiscussionThreadEnum.WIDTH : 0,
  zIndex: ZIndex.SIDEBAR
}))

const ThreadColumn = styled('div')({
  alignItems: 'center',
  bottom: 0,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'flex-end',
  maxWidth: 700,
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

const AvatarGroup = styled(LabelHeading)({
  alignItems: 'center',
  display: 'flex',
  textTransform: 'none',
  width: '100%'
})

const DiscussingGroup = styled('div')({
  alignItems: 'center',
  borderBottom: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: '6px 0px 6px 6px',
  width: '100%'
})

const StyledAvatar = styled(Avatar)({
  margin: '6px 3px',
  transition: 'all 150ms'
})

const Toggle = styled(SidebarToggle)({
  left: 3,
  marginRight: 20,
  position: 'relative'
})

interface Props {
  isDesktop: boolean
  isOpen: boolean
  meeting: EstimatePhaseDiscussionDrawer_meeting
  onToggle: () => void
}

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, isOpen, meeting, onToggle} = props
  const {id: meetingId, endedAt, localStage, viewerMeetingMember} = meeting
  const {user} = viewerMeetingMember
  const {picture} = user
  const {serviceTaskId} = localStage
  const ref = useRef<HTMLDivElement>(null)
  const meetingControlBarBottom = 16
  const coverableHeight = isDesktop ? MeetingControlBarEnum.HEIGHT + meetingControlBarBottom : 0
  useCoverable('drawer', ref, coverableHeight) || !!endedAt

  return (
    <Drawer isDesktop={isDesktop} isOpen={isOpen} ref={ref}>
      <DiscussingGroup>
        <AvatarGroup>
          {[1, 2, 3, 4].map((__example, idx) => {
            return <StyledAvatar key={idx} size={32} picture={picture} />
          })}
        </AvatarGroup>
        <Toggle dataCy='right-drawer-open' onClick={onToggle} />
      </DiscussingGroup>
      <ThreadColumn>
        <DiscussionThreadRoot
          meetingId={meetingId}
          threadSourceId={serviceTaskId!}
          meetingContentRef={ref}
        />
      </ThreadColumn>
    </Drawer>
  )
}

graphql`
  fragment EstimatePhaseDiscussionDrawerStage on EstimateStage {
    serviceTaskId
  }
`
export default createFragmentContainer(EstimatePhaseDiscussionDrawer, {
  meeting: graphql`
    fragment EstimatePhaseDiscussionDrawer_meeting on PokerMeeting {
      id
      endedAt
      localStage {
        ...EstimatePhaseDiscussionDrawerStage @relay(mask: false)
      }
      viewerMeetingMember {
        user {
          picture
        }
      }
    }
  `
})
