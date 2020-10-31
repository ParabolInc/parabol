import styled from '@emotion/styled'
import React, {useRef, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {desktopSidebarShadow} from '~/styles/elevation'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {EstimatePhaseDiscussionDrawer_meeting} from '~/__generated__/EstimatePhaseDiscussionDrawer_meeting.graphql'
import {Breakpoint, DiscussionThreadEnum, MeetingControlBarEnum, ZIndex} from '../types/constEnums'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import SwipeableDashSidebar from './SwipeableDashSidebar'
import {PALETTE} from '~/styles/paletteV2'
import Icon from './Icon'
import {ICON_SIZE} from '~/styles/typographyV2'
import PlainButton from './PlainButton/PlainButton'
import LabelHeading from './LabelHeading/LabelHeading'
import Avatar from './Avatar/Avatar'

const Drawer = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: desktopSidebarShadow,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  position: 'fixed',
  justifyContent: 'space-between',
  top: 0,
  right: 0,
  width: DiscussionThreadEnum.WIDTH,
  zIndex: ZIndex.SIDE_SHEET, // make sure shadow is above cards
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    height: isExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    width: DiscussionThreadEnum.WIDTH
  }
  // [desktopBreakpointMediaQuery]: {
  //   boxShadow: desktopSidebarShadow,
  //   position: 'relative',
  //   top: 0
  // },
  // [desktopDashWidestMediaQuery]: {
  //   position: 'fixed',
  //   top: AppBar.HEIGHT
  // }
}))

const MobileSidebar = styled('div')<{hideDrawer: boolean | null}>(({hideDrawer}) => ({
  bottom: 0,
  display: 'flex',
  flex: 1,
  height: '100vh',
  justifyContent: 'flex-end',
  overflow: 'hidden',
  position: 'fixed',
  right: 0,
  top: 0,
  userSelect: 'none',
  minWidth: DiscussionThreadEnum.WIDTH,
  maxWidth: DiscussionThreadEnum.WIDTH
}))

const VideoContainer = styled('div')<{showVideo: boolean | null}>(({showVideo}) => ({
  display: showVideo ? 'flex' : 'none',
  // height: '30%',
  backgroundColor: '#FFFFFF',
  height: '200px',
  width: '100%'
}))

const Content = styled('div')({
  backgroundColor: '#FFFFFF',
  display: 'flex',
  overflow: 'hidden',
  height: '100%',
  flexDirection: 'column',
  // width: '35%'
  width: '100%'
})

const ThreadColumn = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  justifyContent: 'flex-end',
  bottom: 0,
  position: 'relative',
  // paddingBottom: isDesktop ? 16 : 8,
  width: '100%',
  maxWidth: 700
})

const ButtonGroup = styled('div')({
  borderLeft: `1px solid ${PALETTE.BORDER_GRAY} `,
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 8,
  height: 16,
  userSelect: 'none',
  width: '100%'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD24,
  cursor: 'pointer'
})

const AvatarGroup = styled(LabelHeading)({
  display: 'flex',
  // margin: '0 0 8px',
  padding: '3px 6px',
  alignItems: 'center',
  textTransform: 'none',
  width: '100%'
})

const DiscussingGroup = styled('div')({
  border: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  display: 'flex',
  padding: '6px',
  alignItems: 'center',
  textTransform: 'none',
  width: '100%'
})

const StyledAvatar = styled(Avatar)({
  margin: '8px 4px',
  transition: 'all 150ms'
})

const CommentIcon = styled(Icon)({
  color: '#FFFF',
  fontSize: ICON_SIZE.MD36
})

const ShowVideoButton = styled(PlainButton)<{showVideo: boolean | null}>(({showVideo}) => ({
  backgroundColor: PALETTE.TEXT_PURPLE,
  borderRadius: '50%',
  height: 56,
  display: showVideo ? 'none' : 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 64
}))

interface Props {
  isDesktop: boolean
  isDrawerOpen: boolean
  toggleDrawer: () => void
  meeting: EstimatePhaseDiscussionDrawer_meeting
}

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, isDrawerOpen, toggleDrawer, meeting} = props
  const {id: meetingId, endedAt, localStage, viewerMeetingMember} = meeting
  const {user} = viewerMeetingMember
  const {picture} = user
  const {__id: storyId} = localStage
  const [showVideo, setShowVideo] = useState(true)
  console.log('EstimatePhaseDiscussionDrawer -> showVideo', showVideo)
  const ref = useRef<HTMLDivElement>(null)
  const isExpanded = useCoverable('drawer', ref, MeetingControlBarEnum.HEIGHT) || !!endedAt

  if (true) {
    return (
      <Drawer isExpanded={isExpanded} ref={ref}>
        <VideoContainer showVideo={showVideo}>
          <ButtonGroup>
            <PlainButton onClick={() => setShowVideo(false)}>
              <StyledIcon>close</StyledIcon>
            </PlainButton>
          </ButtonGroup>
        </VideoContainer>
        <DiscussingGroup>
          <AvatarGroup>
            {[1, 2, 3, 4].map((__example, idx) => {
              return <StyledAvatar key={idx} size={32} picture={picture} />
            })}
          </AvatarGroup>
          <ShowVideoButton showVideo={showVideo} onClick={() => setShowVideo(true)}>
            <CommentIcon>comment</CommentIcon>
          </ShowVideoButton>
        </DiscussingGroup>
        <ThreadColumn isDesktop={isDesktop}>
          <DiscussionThreadRoot meetingId={meetingId} threadSourceId={storyId} />
        </ThreadColumn>
      </Drawer>
    )
  }
  return (
    <SwipeableDashSidebar isOpen={isDrawerOpen} isRightSidebar onToggle={toggleDrawer}>
      <MobileSidebar hideDrawer={!isDrawerOpen}>
        <Content>
          <h1>Mobile</h1>
        </Content>
      </MobileSidebar>
    </SwipeableDashSidebar>
  )
}

graphql`
  fragment EstimatePhaseDiscussionDrawerStage on EstimateStage {
    ... on EstimateStageJira {
      __id
    }
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
