import {datadogRum} from '@datadog/browser-rum'
import {Lock} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import action from '../../../static/images/illustrations/action.png'
import retrospective from '../../../static/images/illustrations/retrospective.png'
import poker from '../../../static/images/illustrations/sprintPoker.png'
import teamPrompt from '../../../static/images/illustrations/teamPrompt.png'
import type {MeetingCard_meeting$key} from '../__generated__/MeetingCard_meeting.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import {MenuPosition} from '../hooks/useCoords'
import useMeetingMemberAvatars from '../hooks/useMeetingMemberAvatars'
import {useMeetingSeriesDate} from '../hooks/useMeetingSeriesDate'
import useMenu from '../hooks/useMenu'
import useTooltip from '../hooks/useTooltip'
import {Breakpoint, ElementWidth} from '../types/constEnums'
import {cn} from '../ui/cn'
import getMeetingPhase from '../utils/getMeetingPhase'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import AvatarList from './AvatarList'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import MeetingCardOptionsMenuRoot from './MeetingCardOptionsMenuRoot'
import {EndRecurringMeetingModal} from './Recurrence/EndRecurringMeetingModal'
import {UpdateRecurrenceSettingsModal} from './Recurrence/UpdateRecurrenceSettingsModal'
import Tooltip from './Tooltip'

const BACKGROUND_CLASSES = {
  retrospective: 'bg-grape-500',
  action: 'bg-aqua-400',
  poker: 'bg-tomato-400',
  teamPrompt: 'bg-jade-400'
} as const

const RECURRING_LABEL_COLORS = {
  retrospective: 'text-grape-600',
  action: 'text-aqua-600',
  poker: 'text-tomato-600',
  teamPrompt: 'text-jade-600'
}

const STACK_DEGREES = {0: 1, 1: -2} as const
const STACK_OFFSET_LEFT = {0: 4, 1: 2} as const
const STACK_OFFSET_TOP = {0: 3, 1: 2} as const

interface Props {
  meeting: MeetingCard_meeting$key
}

const ILLUSTRATIONS = {retrospective, action, poker, teamPrompt}
const MEETING_TYPE_LABEL = {
  retrospective: 'Retro',
  action: 'Check-In',
  poker: 'Sprint Poker',
  teamPrompt: 'Standup'
}

const MeetingCard = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment MeetingCard_meeting on NewMeeting {
        ...useMeetingMemberAvatars_meeting
        ...EndRecurringMeetingModal_meeting
        ...UpdateRecurrenceSettingsModal_meeting
        ...useMeetingSeriesDate_meeting
        id
        name
        meetingType
        locked
        endedAt
        phases {
          phaseType
          stages {
            id
            isComplete
          }
        }
        facilitatorStageId
        team {
          id
          name
          orgId
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
          nextMeetingDate
        }
      }
    `,
    meetingRef
  )
  const {
    name,
    team,
    id: meetingId,
    meetingType,
    phases,
    facilitatorStageId,
    meetingSeries,
    endedAt,
    locked
  } = meeting
  const connectedUsers = useMeetingMemberAvatars(meeting)
  const {label: dateLabel, tooltip: readableNextMeetingDate} = useMeetingSeriesDate(meeting)
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
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

  const [isRecurrenceSettingsOpen, setIsRecurrenceSettingsOpen] = useState(false)
  const [isEndRecurringMeetingOpen, setIsEndRecurringMeetingOpen] = useState(false)

  if (!team) {
    // 95% sure there's a bug in relay causing this
    const errObj = {id: meetingId} as any
    datadogRum.addError(new Error(`Missing Team on Meeting ${JSON.stringify(errObj)}`))
    return null
  }
  const {id: teamId, name: teamName, orgId} = team

  const isRecurring = !!(meetingSeries && !meetingSeries.cancelledAt)
  const isCompleted = !!endedAt
  const meetingPhase = getMeetingPhase(phases, facilitatorStageId)
  const meetingPhaseLabel = isCompleted
    ? 'Completed'
    : (meetingPhase && phaseLabelLookup[meetingPhase.phaseType]) || 'Complete'

  const meetingLink = `/meet/${meetingId}`

  const imgSection = (
    <div className='relative block rounded-t-card'>
      <div
        className={cn(
          'absolute top-0 bottom-1.5 block w-full rounded-t-card',
          BACKGROUND_CLASSES[meetingType]
        )}
      />
      <span className='absolute top-2 left-2 font-semibold text-white text-xs'>
        {MEETING_TYPE_LABEL[meetingType]}
      </span>
      {isRecurring && (
        <span
          className={cn(
            'absolute top-2 right-2 rounded-[64px] bg-[#fffc] px-2 py-1 font-medium text-[11px] leading-3',
            RECURRING_LABEL_COLORS[meetingType]
          )}
        >
          Recurring
        </span>
      )}
      <img
        src={ILLUSTRATIONS[meetingType]}
        alt=''
        className='relative mx-auto block h-45 overflow-hidden rounded-t-card pt-6 dark:brightness-[.94]'
      />
    </div>
  )

  return (
    <motion.div
      className='relative m-2 max-w-full shrink-0 select-none'
      style={{width: maybeTabletPlus ? ElementWidth.MEETING_CARD : 'calc(100% - 16px)'}}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0, transition: {duration: 0.15, ease: 'easeOut'}}}
      transition={{duration: 0.25, ease: 'easeIn'}}
    >
      <div className='relative hover:shadow-card-hover'>
        {isRecurring && (
          <>
            <div
              className='absolute block h-full w-full rounded-card bg-surface-card shadow-card'
              style={{
                left: STACK_OFFSET_LEFT[0],
                top: STACK_OFFSET_TOP[0],
                transform: `rotate(${STACK_DEGREES[0]}deg)`
              }}
            >
              {imgSection}
            </div>
            <div
              className='absolute block h-full w-full rounded-card bg-surface-card shadow-card'
              style={{
                left: STACK_OFFSET_LEFT[1],
                top: STACK_OFFSET_TOP[1],
                transform: `rotate(${STACK_DEGREES[1]}deg)`
              }}
            >
              {imgSection}
            </div>
          </>
        )}
        <div className='relative rounded-card bg-surface-card shadow-card'>
          <div className='relative block rounded-t-card'>
            <div
              className={cn(
                'absolute top-0 bottom-1.5 block w-full rounded-t-card',
                BACKGROUND_CLASSES[meetingType]
              )}
            />
            <span className='absolute top-2 left-2 font-semibold text-white text-xs'>
              {MEETING_TYPE_LABEL[meetingType]}
            </span>
            {isRecurring && (
              <span
                className={cn(
                  'absolute top-2 right-2 rounded-[64px] bg-[#fffc] px-2 py-1 font-medium text-[11px] leading-3',
                  RECURRING_LABEL_COLORS[meetingType]
                )}
              >
                Recurring
              </span>
            )}
            <Link to={meetingLink}>
              <img
                src={ILLUSTRATIONS[meetingType]}
                alt=''
                className='relative mx-auto block h-45 overflow-hidden rounded-t-card pt-6 dark:brightness-[.94]'
              />
            </Link>
          </div>
          <div className='pt-1 pr-2 pb-3 pl-4'>
            <div className='relative flex items-center'>
              {locked && (
                <Link to={`/me/organizations/${orgId}/billing`}>
                  <Lock className='text-tomato-500' />
                </Link>
              )}
              <Link to={meetingLink}>
                {isRecurring ? (
                  <>
                    <span className='wrap-break-word block pt-1 pr-8 text-fg-primary text-xl leading-6'>
                      {meetingSeries.title}
                    </span>
                    <Tooltip text={readableNextMeetingDate}>
                      <div className='text-sm'>{dateLabel}</div>
                    </Tooltip>
                  </>
                ) : (
                  <span className='wrap-break-word block pt-1 pr-8 text-fg-primary text-xl leading-6'>
                    {name}
                  </span>
                )}
              </Link>
              <CardButton
                className='absolute top-0 right-0 h-8 w-8 text-fg-primary opacity-100 hover:bg-surface-well'
                ref={originRef}
                onClick={togglePortal}
              >
                <IconLabel ref={tooltipRef} icon='more_vert' />
              </CardButton>
            </div>
            <Link to={meetingLink}>
              <span className='wrap-break-word block pt-1 pb-2 text-fg-secondary text-sm'>
                {teamName} • {meetingPhaseLabel}
              </span>
            </Link>
            <AvatarList users={connectedUsers} size={28} borderColor='var(--color-surface-card)' />
          </div>
          {menuPortal(
            <MeetingCardOptionsMenuRoot
              meetingId={meetingId}
              teamId={teamId}
              menuProps={menuProps}
              popTooltip={popTooltip}
              openEndRecurringMeetingModal={() => setIsEndRecurringMeetingOpen(true)}
              openRecurrenceSettingsModal={() => setIsRecurrenceSettingsOpen(true)}
            />
          )}
          {tooltipPortal('Copied!')}
          {meeting && (
            <EndRecurringMeetingModal
              meetingRef={meeting}
              nextMeetingDate={isRecurring ? meetingSeries.nextMeetingDate : undefined}
              isOpen={isEndRecurringMeetingOpen}
              closeModal={() => setIsEndRecurringMeetingOpen(false)}
            />
          )}
          {meeting && (
            <UpdateRecurrenceSettingsModal
              meeting={meeting}
              isOpen={isRecurrenceSettingsOpen}
              closeModal={() => setIsRecurrenceSettingsOpen(false)}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MeetingCard
