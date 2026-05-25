import graphql from 'babel-plugin-relay/macro'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
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
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import useModal from '../hooks/useModal'
import useMutationProps from '../hooks/useMutationProps'
import {TransitionStatus} from '../hooks/useTransition'
import UpdateMeetingSeriesMutation from '../mutations/UpdateMeetingSeriesMutation'
import {cn} from '../ui/cn'
import {CancelSeriesConfirmationModal} from './CancelSeriesConfirmationModal'
import CardButton from './CardButton'
import {EditMeetingSeriesModal} from './EditMeetingSeriesModal'
import IconLabel from './IconLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import Tooltip from './Tooltip'

const STACK_CLASSES = {
  0: 'rotate-1 top-[3px] left-1',
  1: '-rotate-2 top-0.5 left-0.5'
}

const MEETING_TYPE_BG = {
  retrospective: 'bg-grape-500',
  action: 'bg-aqua-400',
  poker: 'bg-tomato-400',
  teamPrompt: 'bg-jade-400'
}

const RECURRING_LABEL_COLORS = {
  retrospective: 'text-grape-600',
  action: 'text-aqua-600',
  poker: 'text-tomato-600',
  teamPrompt: 'text-jade-600'
}

const ILLUSTRATIONS = {retrospective, action, poker, teamPrompt}
const MEETING_TYPE_LABEL = {
  retrospective: 'Retro',
  action: 'Check-In',
  poker: 'Sprint Poker',
  teamPrompt: 'Standup'
}

const STACKED_CARD_BASE =
  'absolute block h-full w-full rounded-card bg-white shadow-card content-[""]'
const MEETING_IMG_WRAPPER = 'relative block rounded-t-card'
const MEETING_IMG = 'relative mx-auto block h-[180px] overflow-hidden rounded-t-card pt-6'

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
  const seriesLink = `/meeting-series/manage/${MeetingSeriesId.split(id)}`
  const isHidden = status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING
  const bgClass = MEETING_TYPE_BG[meetingType]
  const illustration = ILLUSTRATIONS[meetingType]

  return (
    <div
      ref={ref}
      className={cn(
        'relative m-2 fuzzy-tablet:mb-0 mb-4 fuzzy-tablet:w-80 w-[calc(100%-16px)] max-w-full shrink-0 select-none [transition:box-shadow_100ms_ease-out,opacity_300ms_ease-out]',
        isHidden ? 'opacity-0' : 'opacity-100'
      )}
      onTransitionEnd={onTransitionEnd}
    >
      <div className='relative hover:shadow-card-hover'>
        <div className={cn(STACKED_CARD_BASE, STACK_CLASSES[0])}>
          <div className={MEETING_IMG_WRAPPER}>
            <div className={cn('absolute top-0 bottom-1.5 block w-full rounded-t-card', bgClass)} />
            <img className={MEETING_IMG} src={illustration} alt='' />
          </div>
        </div>
        <div className={cn(STACKED_CARD_BASE, STACK_CLASSES[1])}>
          <div className={MEETING_IMG_WRAPPER}>
            <div className={cn('absolute top-0 bottom-1.5 block w-full rounded-t-card', bgClass)} />
            <img className={MEETING_IMG} src={illustration} alt='' />
          </div>
        </div>
        <div className='relative rounded-card bg-white shadow-card'>
          <div className={MEETING_IMG_WRAPPER}>
            <div className={cn('absolute top-0 bottom-1.5 block w-full rounded-t-card', bgClass)} />
            <span className='absolute top-2 left-2 font-semibold text-white text-xs'>
              {MEETING_TYPE_LABEL[meetingType]}
            </span>
            <span
              className={cn(
                'absolute top-2 right-2 rounded-[64px] bg-[#fffc] px-2 py-1 font-medium text-[11px] leading-3',
                RECURRING_LABEL_COLORS[meetingType]
              )}
            >
              Scheduled
            </span>
            <Link to={seriesLink} onClick={openEdit}>
              <img className={MEETING_IMG} src={illustration} alt='' />
            </Link>
          </div>
          <div className='pt-1 pr-2 pb-3 pl-4'>
            <div className='relative flex items-center'>
              <Link to={seriesLink} onClick={openEdit}>
                <span className='wrap-break-word block pt-1 pr-8 text-slate-700 text-xl leading-6'>
                  {title}
                </span>
                <Tooltip text={tooltip}>
                  <div className='text-sm'>{label}</div>
                </Tooltip>
              </Link>
              <CardButton
                ref={originRef}
                onClick={togglePortal}
                className='absolute top-0 right-0 h-8 w-8 opacity-100'
              >
                <IconLabel icon='more_vert' />
              </CardButton>
            </div>
            <Link to={seriesLink} onClick={openEdit}>
              <span className='block pt-1 pb-2 text-slate-600 text-sm'>
                {MEETING_TYPE_LABEL[meetingType]} • Awaiting first meeting
              </span>
            </Link>
          </div>
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
        </div>
      </div>
    </div>
  )
}

export default ScheduledSeriesCard
