import styled from '@emotion/styled'
import * as Sentry from '@sentry/browser'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import action from '../../../static/images/illustrations/action.png'
import retrospective from '../../../static/images/illustrations/retrospective.png'
import poker from '../../../static/images/illustrations/sprintPoker.png'
import teamPrompt from '../../../static/images/illustrations/teamPrompt.png'
import {MeetingCard_meeting$key} from '../__generated__/MeetingCard_meeting.graphql'
import useAnimatedCard from '../hooks/useAnimatedCard'
import useBreakpoint from '../hooks/useBreakpoint'
import {MenuPosition} from '../hooks/useCoords'
import useMeetingMemberAvatars from '../hooks/useMeetingMemberAvatars'
import useMenu from '../hooks/useMenu'
import useModal from '../hooks/useModal'
import useTooltip from '../hooks/useTooltip'
import {TransitionStatus} from '../hooks/useTransition'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, Breakpoint, Card, ElementWidth} from '../types/constEnums'
import getMeetingPhase from '../utils/getMeetingPhase'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import AvatarList from './AvatarList'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import MeetingCardOptionsMenuRoot from './MeetingCardOptionsMenuRoot'
import {EndRecurringMeetingModal} from './Recurrence/EndRecurringMeetingModal'
import {UpdateRecurrenceSettingsModal} from './Recurrence/UpdateRecurrenceSettingsModal'

const CardWrapper = styled('div')<{
  maybeTabletPlus: boolean
  status: TransitionStatus
}>(({maybeTabletPlus, status}) => ({
  position: 'relative',
  flexShrink: 0,
  maxWidth: '100%',
  transition: `box-shadow 100ms ${BezierCurve.DECELERATE}, opacity 300ms ${BezierCurve.DECELERATE}`,
  marginBottom: maybeTabletPlus ? 0 : 16,
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  margin: 8,
  width: maybeTabletPlus ? ElementWidth.MEETING_CARD : '100%',
  userSelect: 'none'
}))

const InnerCardWrapper = styled('div')({
  position: 'relative',
  ':hover': {
    boxShadow: Elevation.CARD_SHADOW_HOVER
  }
})

const STACK_DEGREES = {
  0: 1,
  1: -2
}

const STACK_OFFSET_LEFT = {
  0: 4,
  1: 2
}

const STACK_OFFSET_TOP = {
  0: 3,
  1: 2
}

const StackedCard = styled('div')<{stackIndex: 0 | 1}>(({stackIndex}) => ({
  content: '""',
  display: 'block',
  position: 'absolute',
  width: '100%',
  height: '100%',
  left: `${STACK_OFFSET_LEFT[stackIndex]}px`,
  top: `${STACK_OFFSET_TOP[stackIndex]}px`,
  transform: `rotate(${STACK_DEGREES[stackIndex]}deg)`,
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW
}))

const InnerCard = styled('div')({
  position: 'relative',
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW
})

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
  teamPrompt: PALETTE.JADE_400
}
const RECURRING_LABEL_COLORS = {
  retrospective: 'text-grape-600 bg-grape-100',
  action: 'text-aqua-600 bg-aqua-300',
  poker: 'text-tomato-600 bg-tomato-300',
  teamPrompt: 'text-jade-600 bg-jade-300'
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
  meeting: MeetingCard_meeting$key
  status: TransitionStatus
  displayIdx: number
}

const ILLUSTRATIONS = {
  retrospective,
  action,
  poker,
  teamPrompt
}
const MEETING_TYPE_LABEL = {
  retrospective: 'Retro',
  action: 'Check-In',
  poker: 'Sprint Poker',
  teamPrompt: 'Standup'
}

const MeetingCard = (props: Props) => {
  const {meeting: meetingRef, status, onTransitionEnd, displayIdx} = props
  const meeting = useFragment(
    graphql`
      fragment MeetingCard_meeting on NewMeeting {
        ...useMeetingMemberAvatars_meeting
        ...EndRecurringMeetingModal_meeting
        ...UpdateRecurrenceSettingsModal_meeting
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
        meetingSeries {
          id
          title
          cancelledAt
          recurrenceRule
        }
      }
    `,
    meetingRef
  )
  const {name, team, id: meetingId, meetingType, phases, meetingSeries} = meeting
  const connectedUsers = useMeetingMemberAvatars(meeting)
  const meetingPhase = getMeetingPhase(phases)
  const meetingPhaseLabel = (meetingPhase && phaseLabelLookup[meetingPhase.phaseType]) || 'Complete'
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const ref = useAnimatedCard(displayIdx, status)
  const popTooltip = () => {
    openTooltip()
    setTimeout(() => {
      closeTooltip()
    }, 2000)
  }
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_RIGHT)

  const {togglePortal: toggleRecurrenceSettingsModal, modalPortal: recurrenceSettingsModal} =
    useModal({id: 'updateRecurrenceSettingsModal'})
  const {togglePortal: toggleEndRecurringMeetingModal, modalPortal: endRecurringMeetingModal} =
    useModal({id: 'endRecurringMeetingModal'})

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

  const isRecurring = !!(meetingSeries && !meetingSeries.cancelledAt)
  const meetingLink = isRecurring ? `/meeting-series/${meetingId}` : `/meet/${meetingId}`

  return (
    <CardWrapper
      ref={ref}
      maybeTabletPlus={maybeTabletPlus}
      status={status}
      onTransitionEnd={onTransitionEnd}
    >
      <InnerCardWrapper>
        {isRecurring && (
          <>
            <StackedCard stackIndex={0}>
              <MeetingImgWrapper>
                <MeetingImgBackground meetingType={meetingType} />
                <MeetingImg src={ILLUSTRATIONS[meetingType]} alt='' />
              </MeetingImgWrapper>
            </StackedCard>
            <StackedCard stackIndex={1}>
              <MeetingImgWrapper>
                <MeetingImgBackground meetingType={meetingType} />
                <MeetingImg src={ILLUSTRATIONS[meetingType]} alt='' />
              </MeetingImgWrapper>
            </StackedCard>
          </>
        )}
        <InnerCard>
          <MeetingImgWrapper>
            <MeetingImgBackground meetingType={meetingType} />
            <MeetingTypeLabel>{MEETING_TYPE_LABEL[meetingType]}</MeetingTypeLabel>
            {isRecurring && (
              <span
                className={clsx(
                  'absolute right-2 top-2 rounded-[64px] px-2 py-1 text-[11px] font-medium leading-3',
                  RECURRING_LABEL_COLORS[meetingType]
                )}
              >
                Recurring
              </span>
            )}
            <Link to={meetingLink}>
              <MeetingImg src={ILLUSTRATIONS[meetingType]} alt='' />
            </Link>
          </MeetingImgWrapper>
          <MeetingInfo>
            <TopLine>
              <Link to={meetingLink}>
                <Name>{isRecurring ? meetingSeries.title : name}</Name>
              </Link>
              <Options ref={originRef} onClick={togglePortal}>
                <IconLabel ref={tooltipRef} icon='more_vert' />
              </Options>
            </TopLine>
            <Link to={meetingLink}>
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
              openEndRecurringMeetingModal={toggleEndRecurringMeetingModal}
              openRecurrenceSettingsModal={toggleRecurrenceSettingsModal}
            />
          )}
          {tooltipPortal('Copied!')}
          {meeting &&
            endRecurringMeetingModal(
              <EndRecurringMeetingModal
                meetingRef={meeting}
                recurrenceRule={isRecurring ? meetingSeries.recurrenceRule : undefined}
                closeModal={toggleEndRecurringMeetingModal}
              />
            )}
          {meeting &&
            recurrenceSettingsModal(
              <UpdateRecurrenceSettingsModal
                meeting={meeting}
                closeModal={toggleRecurrenceSettingsModal}
              />
            )}
        </InnerCard>
      </InnerCardWrapper>
    </CardWrapper>
  )
}

export default MeetingCard
