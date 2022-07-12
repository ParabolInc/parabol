import styled from '@emotion/styled'
import React, {useCallback} from 'react'
import {Link} from 'react-router-dom'
import retrospective from '../../../static/images/illustrations/retrospective.png'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, Breakpoint, Card, ElementWidth} from '../types/constEnums'

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

const BACKGROUND_COLORS = {
  retrospective: PALETTE.GRAPE_500,
  action: PALETTE.AQUA_400,
  poker: PALETTE.TOMATO_400,
  teamPrompt: PALETTE.JADE_300
}
const MeetingImgBackground = styled.div<{meetingType: keyof typeof BACKGROUND_COLORS}>(
  ({meetingType}) => ({
    background: BACKGROUND_COLORS[meetingType],
    borderRadius: `${Card.BORDER_RADIUS}px ${Card.BORDER_RADIUS}px 0 0`,
    display: 'block',
    position: 'absolute',
    top: 0,
    bottom: '6px',
    width: '100%'
  })
)

const MeetingImgWrapper = styled('div')({
  borderRadius: `${Card.BORDER_RADIUS}px ${Card.BORDER_RADIUS}px 0 0`,
  display: 'block',
  position: 'relative'
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
  height: '180px'
})

const TopLine = styled('div')({
  position: 'relative',
  display: 'flex'
})

const DemoMeetingCard = () => {
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const atmospehere = useAtmosphere()
  const {viewerId} = atmospehere

  const onOpen = useCallback(() => {
    SendClientSegmentEventMutation(atmospehere, 'Demo Meeting Card Clicked', {
      viewerId
    })
  }, [])

  return (
    <CardWrapper maybeTabletPlus={maybeTabletPlus} onClick={onOpen}>
      <Link to={`/retrospective-demo`}>
        <MeetingImgWrapper>
          <MeetingImgBackground meetingType='retrospective' />
          <MeetingTypeLabel>Retro</MeetingTypeLabel>
          <MeetingImg src={retrospective} alt='' />
        </MeetingImgWrapper>
        <MeetingInfo>
          <TopLine>
            <Name>Retrospective Demo</Name>
          </TopLine>
          <Meta>Demo team • Reflect</Meta>
        </MeetingInfo>
      </Link>
    </CardWrapper>
  )
}

export default DemoMeetingCard
