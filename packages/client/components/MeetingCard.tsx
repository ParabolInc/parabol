import styled from '@emotion/styled'
import * as Sentry from '@sentry/browser'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {Link} from 'react-router-dom'
import poker from '../../../static/images/illustrations/poker-mtg-color-bg.svg'
import retrospective from '../../../static/images/illustrations/retro-mtg-color-bg.svg'
import action from '../../../static/images/illustrations/standup-mtg-color-bg.svg'
import useBreakpoint from '../hooks/useBreakpoint'
import {MenuPosition} from '../hooks/useCoords'
import useMeetingMemberAvatars from '../hooks/useMeetingMemberAvatars'
import useMenu from '../hooks/useMenu'
import useTooltip from '../hooks/useTooltip'
import {TransitionStatus} from '../hooks/useTransition'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, Breakpoint, Card, ElementWidth} from '../types/constEnums'
import getMeetingPhase from '../utils/getMeetingPhase'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import {MeetingCard_meeting} from '../__generated__/MeetingCard_meeting.graphql'
import AvatarList from './AvatarList'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import MeetingCardOptionsMenuRoot from './MeetingCardOptionsMenuRoot'

const CardWrapper = styled('div')<{
  maybeTabletPlus: boolean
  left: number
  status: number
  top: number
}>(({maybeTabletPlus, left, status, top}) => ({
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW,
  flexShrink: 0,
  maxWidth: '100%',
  transform: maybeTabletPlus ? `translate(${left}px, ${top}px)` : undefined,
  transition: `transform 300ms ${BezierCurve.DECELERATE}, box-shadow 100ms ${BezierCurve.DECELERATE}`,
  marginBottom: maybeTabletPlus ? 0 : 16,
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  position: maybeTabletPlus ? 'absolute' : 'inherit',
  width: maybeTabletPlus ? ElementWidth.MEETING_CARD : '100%',
  userSelect: 'none',
  ':hover': {
    boxShadow: Elevation.CARD_SHADOW_HOVER
  }
}))

const MeetingInfo = styled('div')({
  // tighter padding for options, meta, avatars
  // keep a nice left edge
  padding: '8px 8px 8px 16px'
})

const Name = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 20,
  lineHeight: '24px',
  // add right padding to keep a long name from falling under the options button
  // add top and bottom padding to keep a single line at 32px to match the options button
  padding: '4px 32px 4px 0'
})

const Meta = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  lineHeight: '24px',
  // partial grid bottom padding accounts for maybe avatar whitespace and offset
  paddingBottom: '4px'
})

const MeetingImgWrapper = styled('div')({
  position: 'relative'
})

const MeetingTypeLabel = styled('div')({
  color: PALETTE.WHITE,
  fontSize: 11,
  fontWeight: 600,
  left: 16,
  lineHeight: '16px',
  position: 'absolute',
  textTransform: 'uppercase',
  top: 12
})

const MeetingImg = styled('img')({
  borderRadius: `${Card.BORDER_RADIUS}px ${Card.BORDER_RADIUS}px 0 0`,
  display: 'block',
  overflow: 'hidden',
  width: '100%'
})

const TopLine = styled('div')({
  position: 'relative',
  display: 'flex'
})
const Options = styled(CardButton)({
  position: 'absolute',
  top: 0,
  right: 0,
  color: PALETTE.SLATE_700,
  height: 32,
  width: 32,
  opacity: 1,
  ':hover': {
    backgroundColor: PALETTE.SLATE_200
  }
})

interface Props {
  onTransitionEnd: () => void
  meeting: MeetingCard_meeting
  left: number
  status: number
  top: number
}

const ILLUSTRATIONS = {
  retrospective,
  action,
  poker
}

const MEETING_TYPE_LABEL = {
  retrospective: 'Retro',
  action: 'Check-in',
  poker: 'Sprint Poker'
}

const MeetingCard = (props: Props) => {
  const {meeting, left, status, onTransitionEnd, top} = props
  const {name, team, id: meetingId, meetingType, phases} = meeting
  const connectedUsers = useMeetingMemberAvatars(meeting)
  if (!team) {
    // 95% sure there's a bug in relay causing this
    const errObj = {id: meetingId} as any
    if (meeting.hasOwnProperty('team')) {
      errObj.team = team
    }
    Sentry.captureException(new Error(`Missing Team on Meeting ${JSON.stringify(errObj)}`))
    return null
  }
  const {id: teamId, name: teamName} = team
  const meetingPhase = getMeetingPhase(phases)
  const meetingPhaseLabel = (meetingPhase && phaseLabelLookup[meetingPhase.phaseType]) || 'Complete'
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const popTooltip = () => {
    openTooltip()
    setTimeout(() => {
      closeTooltip()
    }, 2000)
  }
  const {tooltipPortal, openTooltip, closeTooltip, originRef: tooltipRef} = useTooltip<
    HTMLDivElement
  >(MenuPosition.UPPER_RIGHT)
  return (
    <CardWrapper
      left={left}
      maybeTabletPlus={maybeTabletPlus}
      status={status}
      top={top}
      onTransitionEnd={onTransitionEnd}
    >
      <MeetingImgWrapper>
        <MeetingTypeLabel>{MEETING_TYPE_LABEL[meetingType]}</MeetingTypeLabel>
        <Link to={`/meet/${meetingId}`}>
          <MeetingImg src={ILLUSTRATIONS[meetingType]} />
        </Link>
      </MeetingImgWrapper>
      <MeetingInfo>
        <TopLine>
          <Link to={`/meet/${meetingId}`}>
            <Name>{name}</Name>
          </Link>
          <Options ref={originRef} onClick={togglePortal}>
            <IconLabel ref={tooltipRef} icon='more_vert' />
          </Options>
        </TopLine>
        <Link to={`/meet/${meetingId}`}>
          <Meta>
            {teamName} • {meetingPhaseLabel}
          </Meta>
        </Link>
        <AvatarList users={connectedUsers} size={28} />
      </MeetingInfo>
      {menuPortal(
        <MeetingCardOptionsMenuRoot
          meetingId={meetingId}
          teamId={teamId}
          menuProps={menuProps}
          popTooltip={popTooltip}
        />
      )}
      {tooltipPortal('Copied!')}
    </CardWrapper>
  )
}

export default createFragmentContainer(MeetingCard, {
  meeting: graphql`
    fragment MeetingCard_meeting on NewMeeting {
      ...useMeetingMemberAvatars_meeting
      id
      name
      meetingType
      phases {
        phaseType
        stages {
          isComplete
        }
      }
      team {
        id
        name
      }
      meetingMembers {
        user {
          ...AvatarListUser_user
        }
      }
    }
  `
})
