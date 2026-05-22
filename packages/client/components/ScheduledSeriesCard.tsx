import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import action from '../../../static/images/illustrations/action.png'
import retrospective from '../../../static/images/illustrations/retrospective.png'
import poker from '../../../static/images/illustrations/sprintPoker.png'
import teamPrompt from '../../../static/images/illustrations/teamPrompt.png'
import type {ScheduledSeriesCard_series$key} from '../__generated__/ScheduledSeriesCard_series.graphql'
import useAnimatedCard from '../hooks/useAnimatedCard'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import useModal from '../hooks/useModal'
import useMutationProps from '../hooks/useMutationProps'
import {TransitionStatus} from '../hooks/useTransition'
import UpdateMeetingSeriesMutation from '../mutations/UpdateMeetingSeriesMutation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, Breakpoint, Card, ElementWidth} from '../types/constEnums'
import {cn} from '../ui/cn'
import {CancelSeriesConfirmationModal} from './CancelSeriesConfirmationModal'
import CardButton from './CardButton'
import {EditMeetingSeriesModal} from './EditMeetingSeriesModal'
import IconLabel from './IconLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import Tooltip from './Tooltip'

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
  width: maybeTabletPlus ? ElementWidth.MEETING_CARD : 'calc(100% - 16px)',
  userSelect: 'none'
}))

const InnerCardWrapper = styled('div')({
  position: 'relative',
  ':hover': {
    boxShadow: Elevation.CARD_SHADOW_HOVER
  }
})

const STACK_DEGREES = {0: 1, 1: -2}
const STACK_OFFSET_LEFT = {0: 4, 1: 2}
const STACK_OFFSET_TOP = {0: 3, 1: 2}

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
  padding: '4px 8px 12px 16px'
})

const Name = styled('span')({
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 20,
  lineHeight: '24px',
  padding: '4px 32px 0 0',
  wordBreak: 'break-word'
})

const BACKGROUND_COLORS = {
  retrospective: PALETTE.GRAPE_500,
  action: PALETTE.AQUA_400,
  poker: PALETTE.TOMATO_400,
  teamPrompt: PALETTE.JADE_400
}
const RECURRING_LABEL_COLORS = {
  retrospective: 'text-grape-600',
  action: 'text-aqua-600',
  poker: 'text-tomato-600',
  teamPrompt: 'text-jade-600'
}
const MeetingImgBackground = styled.div<{
  meetingType: keyof typeof BACKGROUND_COLORS
}>(({meetingType}) => ({
  background: BACKGROUND_COLORS[meetingType],
  borderRadius: `${Card.BORDER_RADIUS}px ${Card.BORDER_RADIUS}px 0 0`,
  display: 'block',
  position: 'absolute',
  top: 0,
  bottom: '6px',
  width: '100%'
}))

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

const ILLUSTRATIONS = {retrospective, action, poker, teamPrompt}
const MEETING_TYPE_LABEL = {
  retrospective: 'Retro',
  action: 'Check-In',
  poker: 'Sprint Poker',
  teamPrompt: 'Standup'
}

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  weekday: 'long',
  timeZoneName: 'short'
})

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

interface Props {
  series: ScheduledSeriesCard_series$key
  status: TransitionStatus
  onTransitionEnd: () => void
  displayIdx: number
}

const ScheduledSeriesCard = (props: Props) => {
  const {series: seriesRef, status, onTransitionEnd, displayIdx} = props
  const series = useFragment(
    graphql`
      fragment ScheduledSeriesCard_series on MeetingSeries {
        id
        title
        meetingType
        nextMeetingDate
        ...MeetingSeriesEditForm_series
      }
    `,
    seriesRef
  )

  const {id, title, meetingType, nextMeetingDate} = series
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const ref = useAnimatedCard(displayIdx, status)
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const {togglePortal: toggleCancelModal, modalPortal: cancelModalPortal} = useModal({
    id: 'cancelSeriesConfirmationModal'
  })

  const onCancelConfirmed = () => {
    if (submitting) return
    submitMutation()
    UpdateMeetingSeriesMutation(
      atmosphere,
      {meetingSeriesId: id, rrule: null},
      {
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'meetingSeriesCancelled',
            message: 'Recurrence cancelled.',
            autoDismiss: 8,
            showDismissButton: true
          })
        }
      }
    )
    toggleCancelModal()
  }

  const nextDate = nextMeetingDate ? new Date(nextMeetingDate) : null
  const label = nextDate ? `Starts ${shortDateFormatter.format(nextDate)}` : 'Scheduled'
  const tooltip = nextDate ? `Starts ${timeFormatter.format(nextDate)}` : ''

  const openEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsEditOpen(true)
  }
  const seriesLink = `/meeting-series/manage/${id}`

  return (
    <CardWrapper
      ref={ref}
      maybeTabletPlus={maybeTabletPlus}
      status={status}
      onTransitionEnd={onTransitionEnd}
    >
      <InnerCardWrapper>
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
        <InnerCard>
          <MeetingImgWrapper>
            <MeetingImgBackground meetingType={meetingType} />
            <MeetingTypeLabel>{MEETING_TYPE_LABEL[meetingType]}</MeetingTypeLabel>
            <span
              className={cn(
                'absolute top-2 right-2 rounded-[64px] bg-[#fffc] px-2 py-1 font-medium text-[11px] leading-3',
                RECURRING_LABEL_COLORS[meetingType]
              )}
            >
              Scheduled
            </span>
            <Link to={seriesLink} onClick={openEdit}>
              <MeetingImg src={ILLUSTRATIONS[meetingType]} alt='' />
            </Link>
          </MeetingImgWrapper>
          <MeetingInfo>
            <div className='relative flex items-center'>
              <Link to={seriesLink} onClick={openEdit}>
                <Name>{title}</Name>
                <Tooltip text={tooltip}>
                  <div className='text-sm'>{label}</div>
                </Tooltip>
              </Link>
              <Options ref={originRef} onClick={togglePortal}>
                <IconLabel icon='more_vert' />
              </Options>
            </div>
            <Link to={seriesLink} onClick={openEdit}>
              <span className='block pt-1 pb-2 text-slate-600 text-sm'>
                {MEETING_TYPE_LABEL[meetingType]} • Awaiting first meeting
              </span>
            </Link>
          </MeetingInfo>
          {menuPortal(
            <Menu ariaLabel='Scheduled meeting options' {...menuProps}>
              <MenuItem
                key='edit'
                label={<div className='flex items-center px-2 py-1'>Edit schedule</div>}
                onClick={() => setIsEditOpen(true)}
              />
              <MenuItem
                key='cancel'
                label={<div className='flex items-center px-2 py-1'>Cancel series</div>}
                onClick={toggleCancelModal}
              />
            </Menu>
          )}
          {cancelModalPortal(
            <CancelSeriesConfirmationModal
              seriesTitle={title}
              onConfirm={onCancelConfirmed}
              closeModal={toggleCancelModal}
            />
          )}
          <EditMeetingSeriesModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            seriesRef={series}
          />
        </InnerCard>
      </InnerCardWrapper>
    </CardWrapper>
  )
}

export default ScheduledSeriesCard
