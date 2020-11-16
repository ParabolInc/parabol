import styled from '@emotion/styled'
import React, {useEffect, useRef} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {desktopSidebarShadow} from '~/styles/elevation'
import {EstimatePhaseDiscussionDrawer_meeting} from '~/__generated__/EstimatePhaseDiscussionDrawer_meeting.graphql'
import {DiscussionThreadEnum, MeetingControlBarEnum, ZIndex} from '../types/constEnums'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import {PALETTE} from '~/styles/paletteV2'
import Icon from './Icon'
import {ICON_SIZE} from '~/styles/typographyV2'
import PlainButton from './PlainButton/PlainButton'
import LabelHeading from './LabelHeading/LabelHeading'
import Avatar from './Avatar/Avatar'
import useAtmosphere from '~/hooks/useAtmosphere'

const Drawer = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  boxShadow: isDesktop ? desktopSidebarShadow : undefined,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  position: isDesktop ? 'fixed' : 'static',
  right: isDesktop ? 0 : undefined,
  userSelect: 'none',
  width: DiscussionThreadEnum.WIDTH,
  zIndex: ZIndex.SIDEBAR
}))

const VideoContainer = styled('div')<{isShowingVideo: boolean}>(({isShowingVideo}) => ({
  display: isShowingVideo ? 'flex' : 'none',
  height: '200px',
  padding: 6
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

const ButtonGroup = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  height: 16,
  userSelect: 'none',
  width: '100%'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD24,
  cursor: 'pointer'
})

const AvatarGroup = styled(LabelHeading)({
  alignItems: 'center',
  display: 'flex',
  textTransform: 'none',
  width: '100%'
})

const DiscussingGroup = styled('div')({
  alignItems: 'center',
  borderTop: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  borderBottom: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  display: 'flex',
  padding: '3px 6px',
  width: '100%'
})

const StyledAvatar = styled(Avatar)({
  margin: '6px 3px',
  transition: 'all 150ms'
})

const ShowVideoIcon = styled(Icon)({
  color: '#FFFF',
  fontSize: ICON_SIZE.MD24
})

const ShowVideoButton = styled(PlainButton)<{isShowingVideo: boolean}>(({isShowingVideo}) => ({
  backgroundColor: PALETTE.TEXT_PURPLE,
  borderRadius: '50%',
  display: isShowingVideo ? 'none' : 'flex',
  margin: '0px 3px',
  padding: 8
}))

interface Props {
  isDesktop: boolean
  meeting: EstimatePhaseDiscussionDrawer_meeting
}

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, meeting} = props
  const {id: meetingId, endedAt, isShowingVideo, localStage, viewerMeetingMember} = meeting
  const {user} = viewerMeetingMember
  const {picture} = user
  const {serviceTaskId} = localStage
  const atmosphere = useAtmosphere()
  const setIsShowingVideo = (isShowing: boolean) => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)!
      meeting.setValue(isShowing, 'isShowingVideo')
    })
  }
  useEffect(() => {
    setIsShowingVideo(true)
  }, [])
  // const [isShowingVideo, setIsShowingVideo] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const meetingControlBarBottom = 16
  const test = ref.current
  // test?.getBoundingClientRect()?.right -= DiscussionThreadEnum.WIDTH
  const coverableHeight = isDesktop ? MeetingControlBarEnum.HEIGHT + meetingControlBarBottom : 0
  useCoverable('drawer', ref, coverableHeight) || !!endedAt

  return (
    <Drawer isDesktop={isDesktop} ref={ref}>
      <VideoContainer isShowingVideo={isShowingVideo}>
        <ButtonGroup>
          <PlainButton>
            <StyledIcon>fullscreen</StyledIcon>
          </PlainButton>
          <PlainButton onClick={() => setIsShowingVideo(false)}>
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
        <ShowVideoButton isShowingVideo={isShowingVideo} onClick={() => setIsShowingVideo(true)}>
          <ShowVideoIcon>videocam</ShowVideoIcon>
        </ShowVideoButton>
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
      isShowingVideo
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
