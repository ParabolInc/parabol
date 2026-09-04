import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Link, useNavigate} from 'react-router'
import {MoreVert, PlayArrow as PlayArrowIcon, Replay as ReplayIcon} from '~/ui/icons'
import type {ScheduledSeriesCard_series$key} from '../__generated__/ScheduledSeriesCard_series.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useStartMeetingSeriesNowMutation from '../mutations/useStartMeetingSeriesNowMutation'
import {cn} from '../ui/cn'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../ui/Menu/MenuItem'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import {
  MeetingTypeToReadable,
  meetingTypeToBgClass,
  meetingTypeToIllustration,
  meetingTypeToLabelClass
} from '../utils/meetings/lookups'
import {EditMeetingSeriesModal} from './EditMeetingSeriesModal'

const STACK_CLASSES = {
  0: 'rotate-1 top-[3px] left-1',
  1: '-rotate-2 top-0.5 left-0.5'
}

const STACKED_CARD_BASE =
  'absolute block h-full w-full rounded-card bg-surface-card shadow-[var(--shadow-card)]'
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
        ownerUserId
        ...EditMeetingSeriesModal_series
      }
    `,
    seriesRef
  )

  const {id, title, meetingType, nextMeetingDate, ownerUserId} = series
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const [startNow, isStarting] = useStartMeetingSeriesNowMutation()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const onStartNow = () => {
    if (isStarting) return
    startNow({
      variables: {meetingSeriesId: id},
      onCompleted: (res) => {
        // an owner can schedule for teams they are not on, & they cannot join those meetings
        const {meeting} = res.startMeetingSeriesNow
        if (meeting) {
          navigate(`/meet/${meeting.id}`)
          return
        }
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: 'startMeetingSeriesNow',
          autoDismiss: 5,
          showDismissButton: true,
          message: 'Started the next meeting for each team'
        })
      }
    })
  }

  const isViewerOwner = ownerUserId === atmosphere.viewerId
  const nextDate = nextMeetingDate ? new Date(nextMeetingDate) : null
  const label = nextDate ? `Starts ${shortDateFormatter.format(nextDate)}` : 'Scheduled'
  const tooltip = nextDate ? `Starts ${timeFormatter.format(nextDate)}` : ''

  const openEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsEditOpen(true)
  }
  const seriesLink = `/meeting-series/manage/${MeetingSeriesId.split(id)}`
  const bgClass = meetingTypeToBgClass[meetingType]
  const illustration = meetingTypeToIllustration[meetingType]

  return (
    <motion.div
      className='relative m-3 fuzzy-tablet:mb-3 mb-4 fuzzy-tablet:w-80 w-[calc(100%-24px)] max-w-full shrink-0 select-none'
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0, transition: {duration: 0.15, ease: 'easeOut'}}}
      transition={{duration: 0.25, ease: 'easeIn'}}
    >
      <div className='relative hover:shadow-[var(--shadow-card-hover)]'>
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
        <div className='relative rounded-card bg-surface-card shadow-[var(--shadow-card)]'>
          <div className={MEETING_IMG_WRAPPER}>
            <div className={cn('absolute top-0 bottom-1.5 block w-full rounded-t-card', bgClass)} />
            <span className='absolute top-2 left-2 font-semibold text-white text-xs'>
              {MeetingTypeToReadable[meetingType]}
            </span>
            <span
              className={cn(
                'absolute top-2 right-2 rounded-[64px] bg-[#fffc] px-2 py-1 font-medium text-[11px] leading-3',
                meetingTypeToLabelClass[meetingType]
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
                  <button className='absolute top-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent opacity-50 outline-hidden hover:bg-surface-hover hover:opacity-100'>
                    <MoreVert className='text-fg-primary text-lg' />
                  </button>
                }
              >
                <MenuContent align='end' sideOffset={4}>
                  {isViewerOwner && (
                    <MenuItem onSelect={onStartNow}>
                      <PlayArrowIcon className={MENU_ITEM_ICON} />
                      Start meeting now
                    </MenuItem>
                  )}
                  <MenuItem onSelect={() => setIsEditOpen(true)}>
                    <ReplayIcon className={MENU_ITEM_ICON} />
                    Edit recurrence settings
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
            <Link to={seriesLink} onClick={openEdit}>
              <span className='block pt-1 pb-2 text-fg-secondary text-sm'>
                {MeetingTypeToReadable[meetingType]} • Awaiting first meeting
              </span>
            </Link>
          </div>
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
