import styled from '@emotion/styled'
import React, {useCallback} from 'react'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import useModal from '../hooks/useModal'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, Breakpoint, Card, ElementWidth} from '../types/constEnums'
import MeetingsDashTutorialModal from './MeetingsDashTutorialModal'

const CardWrapper = styled('div')<{
  maybeTabletPlus: boolean
}>(({maybeTabletPlus}) => ({
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW,
  flexShrink: 0,
  maxWidth: '100%',
  transition: `box-shadow 100ms ${BezierCurve.DECELERATE}, opacity 300ms ${BezierCurve.DECELERATE}`,
  marginBottom: maybeTabletPlus ? 0 : 16,
  margin: 8,
  width: maybeTabletPlus ? ElementWidth.MEETING_CARD : '100%',
  userSelect: 'none',
  cursor: 'pointer',
  ':hover': {
    boxShadow: Elevation.CARD_SHADOW_HOVER
  }
}))

const MeetingInfo = styled('div')({
  // tighter padding for options, meta, avatars
  // keep a nice left edge
  padding: '4px 8px 12px 16px'
})

const Name = styled('span')({
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 20,
  lineHeight: '24px',
  // add right padding to keep a long name from falling under the options button
  // add top and bottom padding to keep a single line at 32px to match the options button
  padding: '4px 32px 4px 0',
  wordBreak: 'break-word'
})

const Meta = styled('span')({
  color: PALETTE.SLATE_600,
  display: 'block',
  fontSize: 14,
  // partial grid bottom padding accounts for maybe avatar whitespace and offset
  paddingBottom: '4px',
  wordBreak: 'break-word'
})

const MeetingImgBackground = styled('div')({
  background: PALETTE.FUSCIA_400,
  borderRadius: `${Card.BORDER_RADIUS}px ${Card.BORDER_RADIUS}px 0 0`,
  display: 'block',
  position: 'absolute',
  top: 0,
  bottom: '0px',
  width: '100%'
})

const MeetingImgWrapper = styled('div')({
  borderRadius: `${Card.BORDER_RADIUS}px ${Card.BORDER_RADIUS}px 0 0`,
  display: 'block',
  position: 'relative',
  bottom: 0,
  marginBottom: '6px'
})

const MeetingTypeLabel = styled('span')({
  color: PALETTE.WHITE,
  fontSize: 12,
  fontWeight: 600,
  position: 'absolute',
  left: 8,
  top: 8
})

const MeetingImg = styled('img')({
  borderRadius: `${Card.BORDER_RADIUS}px ${Card.BORDER_RADIUS}px 0 0`,
  position: 'relative',
  display: 'block',
  overflow: 'hidden',
  paddingTop: 24,
  marginLeft: 'auto',
  marginRight: 'auto',
  height: '174px'
})

const TopLine = styled('div')({
  position: 'relative',
  display: 'flex'
})

const THUMBNAIL = 'http://i.ytimg.com/vi/X_i60AMxPBU/maxresdefault.jpg'

const TutorialMeetingCard = () => {
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const atmospehere = useAtmosphere()
  const {viewerId} = atmospehere

  const onOpen = useCallback(() => {
    SendClientSegmentEventMutation(atmospehere, 'Tutorial Meeting Card Opened', {
      viewerId
    })
  }, [])
  const onClose = useCallback(() => {
    SendClientSegmentEventMutation(atmospehere, 'Tutorial Meeting Card Closed', {
      viewerId
    })
  }, [])

  const {togglePortal: toggleModal, modalPortal} = useModal({onOpen, onClose})

  return (
    <>
      <CardWrapper maybeTabletPlus={maybeTabletPlus} onClick={toggleModal}>
        <MeetingImgWrapper>
          <MeetingImgBackground />
          <MeetingTypeLabel>Tutorial</MeetingTypeLabel>
          <MeetingImg src={THUMBNAIL} alt='' />
        </MeetingImgWrapper>
        <MeetingInfo>
          <TopLine>
            <Name>Starting a Sprint Poker Meeting</Name>
          </TopLine>
          <Meta>Video tutorial</Meta>
        </MeetingInfo>
      </CardWrapper>
      {modalPortal(<MeetingsDashTutorialModal />)}
    </>
  )
}

export default TutorialMeetingCard
