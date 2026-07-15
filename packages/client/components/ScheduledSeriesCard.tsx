import {MoreVert} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import action from '../../../static/images/illustrations/action.png'
import retrospective from '../../../static/images/illustrations/retrospective.png'
import poker from '../../../static/images/illustrations/sprintPoker.png'
import teamPrompt from '../../../static/images/illustrations/teamPrompt.png'
import type {ScheduledSeriesCard_series$key} from '../__generated__/ScheduledSeriesCard_series.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdateMeetingSeriesMutation from '../mutations/UpdateMeetingSeriesMutation'
import {cn} from '../ui/cn'
import {useDialogState} from '../ui/Dialog/useDialogState'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import {CancelSeriesConfirmationModal} from './CancelSeriesConfirmationModal'
import {EditMeetingSeriesModal} from './EditMeetingSeriesModal'

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

const STACKED_CARD_BASE = 'absolute block h-full w-full rounded-card bg-surface-card shadow-card'
const MEETING_IMG_WRAPPER = 'relative block rounded-t-card'
const MEETING_IMG =
  'relative mx-auto block h-[180px] overflow-hidden rounded-t-card pt-6 dark:brightness-[.94]'

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
}

const ScheduledSeriesCard = (props: Props) => {
  const {series: seriesRef} = props
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
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const cancelDialog = useDialogState()

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
    cancelDialog.close()
  }

  const nextDate = nextMeetingDate ? new Date(nextMeetingDate) : null
  const label = nextDate ? `Starts ${shortDateFormatter.format(nextDate)}` : 'Scheduled'
  const tooltip = nextDate ? `Starts ${timeFormatter.format(nextDate)}` : ''

  const openEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsEditOpen(true)
  }
  const seriesLink = `/meeting-series/manage/${MeetingSeriesId.split(id)}`
  const bgClass = MEETING_TYPE_BG[meetingType]
  const illustration = ILLUSTRATIONS[meetingType]

  return (
    <motion.div
      className='relative m-2 fuzzy-tablet:mb-0 mb-4 fuzzy-tablet:w-80 w-[calc(100%-16px)] max-w-full shrink-0 select-none'
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0, transition: {duration: 0.15, ease: 'easeOut'}}}
      transition={{duration: 0.25, ease: 'easeIn'}}
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
        <div className='relative rounded-card bg-surface-card shadow-card'>
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
                <span className='wrap-break-word block pt-1 pr-8 text-fg-primary text-xl leading-6'>
                  {title}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='text-sm'>{label}</div>
                  </TooltipTrigger>
                  {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
                </Tooltip>
              </Link>
              <Menu
                trigger={
                  <button className='absolute top-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent opacity-50 outline-hidden hover:bg-surface-well hover:opacity-100'>
                    <MoreVert className='text-fg-primary text-lg' />
                  </button>
                }
              >
                <MenuContent align='end' sideOffset={4}>
                  <MenuItem onSelect={() => setIsEditOpen(true)}>Edit schedule</MenuItem>
                  <MenuItem onSelect={cancelDialog.open}>Cancel series</MenuItem>
                </MenuContent>
              </Menu>
            </div>
            <Link to={seriesLink} onClick={openEdit}>
              <span className='block pt-1 pb-2 text-fg-secondary text-sm'>
                {MEETING_TYPE_LABEL[meetingType]} • Awaiting first meeting
              </span>
            </Link>
          </div>
          <CancelSeriesConfirmationModal
            isOpen={cancelDialog.isOpen}
            onClose={cancelDialog.close}
            seriesTitle={title}
            onConfirm={onCancelConfirmed}
          />
          <EditMeetingSeriesModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            seriesRef={series}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default ScheduledSeriesCard
