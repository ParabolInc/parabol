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
import useMenu from '../hooks/useMenu'
import useTooltip from '../hooks/useTooltip'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, Breakpoint, Card} from '../types/constEnums'
import getMeetingPhase from '../utils/getMeetingPhase'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import {MeetingCard_meeting} from '../__generated__/MeetingCard_meeting.graphql'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import MeetingCardOptionsMenuRoot from './MeetingCardOptionsMenuRoot'

const CardWrapper = styled('div')<{maybeTabletPlus: boolean}>(({maybeTabletPlus}) => ({
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW,
  flexShrink: 0,
  maxWidth: '100%',
  margin: maybeTabletPlus ? '0 16px 16px 0' : '0 0 16px',
  transition: `box-shadow 100ms ${BezierCurve.DECELERATE}`,
  width: maybeTabletPlus ? 320 : '100%',
  userSelect: 'none',
  ':hover': {
    boxShadow: Elevation.CARD_SHADOW_HOVER
  }
}))

const MeetingInfo = styled('div')({
  padding: '12px 16px'
})

const Name = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 20,
  lineHeight: '32px'
})

const Meta = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  lineHeight: '24px'
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

const Options = styled(CardButton)({
  position: 'absolute',
  top: 4,
  right: 4,
  color: '#fff',
  height: 32,
  width: 32,
  opacity: 1,
  ':hover': {
    backgroundColor: '#FFFFFF26'
  }
})
interface Props {
  meeting: MeetingCard_meeting
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
  const {meeting} = props
  const {name, team, id: meetingId, meetingType, phases} = meeting
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
    <CardWrapper maybeTabletPlus={maybeTabletPlus}>
      <MeetingImgWrapper>
        <MeetingTypeLabel>{MEETING_TYPE_LABEL[meetingType]}</MeetingTypeLabel>
        <MeetingImg src={ILLUSTRATIONS[meetingType]} />
        <Options ref={originRef} onClick={togglePortal}>
          <IconLabel ref={tooltipRef} icon='more_vert' />
        </Options>
      </MeetingImgWrapper>
      <MeetingInfo>
        <Link to={`/meet/${meetingId}`}>
          <Name>{name}</Name>
          <Meta>
            {teamName} • {meetingPhaseLabel}
          </Meta>
        </Link>
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
    }
  `
})
