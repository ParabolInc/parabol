/**
 * The Meeting Series Group card (design 1a): one card standing in for the N near-identical
 * series a single owner scheduled across N teams.
 *
 * Drop-in location: packages/client/components/MeetingSeriesGroupCard.tsx
 *
 * Rendered by MeetingsDash for any group returned by getMeetingSeriesGroups with 2+ series.
 * Groups of one keep using ScheduledSeriesCard / MeetingCard unchanged.
 */
import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {
  Groups as GroupsIcon,
  MoreVert,
  PlayArrow as PlayArrowIcon,
  Replay as ReplayIcon,
  Widgets as WidgetsIcon
} from '~/ui/icons'
import type {MeetingSeriesGroupCard_series$key} from '../__generated__/MeetingSeriesGroupCard_series.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useStartMeetingSeriesNowMutation from '../mutations/useStartMeetingSeriesNowMutation'
import {initials} from '../shared/initials'
import {cn} from '../ui/cn'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../ui/Menu/MenuItem'
import {
  MeetingTypeToReadable,
  meetingTypeToBgClass,
  meetingTypeToIllustration,
  meetingTypeToLabelClass
} from '../utils/meetings/lookups'
import {EditMeetingSeriesModal} from './EditMeetingSeriesModal'
import ManageMeetingSeriesGroupModalRoot from './ManageMeetingSeriesGroupModalRoot'

// one more layer than a single recurring card, so a group reads as a deeper deck
const STACK_CLASSES = {
  0: 'rotate-[1.5deg] top-[5px] left-1.5',
  1: '-rotate-[2.5deg] top-[3px] left-[3px]'
}
const STACKED_CARD_BASE =
  'absolute block h-full w-full rounded-card bg-surface-card shadow-[var(--shadow-card)]'
const MEETING_IMG_WRAPPER = 'relative block rounded-t-card'
const MEETING_IMG =
  'relative mx-auto block h-[180px] overflow-hidden rounded-t-card pt-6 dark:brightness-[.94]'

const scheduleFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

const MAX_MONOGRAMS = 5

interface Props {
  seriesRefs: MeetingSeriesGroupCard_series$key
  /** human-readable recurrence, e.g. "every 2 weeks on Monday" */
  recurrenceLabel: string
}

const MeetingSeriesGroupCard = (props: Props) => {
  const {seriesRefs, recurrenceLabel} = props
  const allSeries = useFragment(
    graphql`
      fragment MeetingSeriesGroupCard_series on MeetingSeries @relay(plural: true) {
        id
        title
        teamId
        meetingType
        nextMeetingDate
        ownerUserId
        urlSlug
        recurrenceRule
        templateId
        activeMeetings {
          id
          teamId
        }
        ...EditMeetingSeriesModal_series
      }
    `,
    seriesRefs
  )
  const atmosphere = useAtmosphere()
  const [startNow, isStarting] = useStartMeetingSeriesNowMutation()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isManageOpen, setIsManageOpen] = useState(false)

  const firstSeries = allSeries[0]!
  const {title, meetingType} = firstSeries
  const isViewerOwner = firstSeries.ownerUserId === atmosphere.viewerId
  const nextMeetingDate = allSeries
    .map((series) => series.nextMeetingDate)
    .filter(Boolean)
    .sort()[0]
  const teamCount = allSeries.length

  const onStartNow = () => {
    if (isStarting) return
    allSeries.forEach((series) => startNow({variables: {meetingSeriesId: series.id}}))
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'startMeetingSeriesGroupNow',
      autoDismiss: 5,
      showDismissButton: true,
      message: `Started the next meeting for ${teamCount} teams`
    })
  }

  const bgClass = meetingTypeToBgClass[meetingType]
  const illustration = meetingTypeToIllustration[meetingType]
  const label = nextMeetingDate
    ? `Next ${scheduleFormatter.format(new Date(nextMeetingDate))}`
    : 'Scheduled'

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
              Recurring
            </span>
            <img className={MEETING_IMG} src={illustration} alt='' />
            <div
              className={cn(
                'absolute bottom-3.5 left-2 flex items-center gap-1.5 rounded-[64px] bg-[#fffc] px-2.5 py-1 font-semibold text-[11px] leading-3',
                meetingTypeToLabelClass[meetingType]
              )}
            >
              <GroupsIcon className='text-[14px]' />
              {teamCount} teams
            </div>
          </div>
          <div className='pt-1 pr-2 pb-3 pl-4'>
            <div className='relative flex items-center'>
              <div>
                <span className='wrap-break-word block pt-1 pr-8 text-fg-primary text-xl leading-6'>
                  {title}
                </span>
                <div className='text-fg-primary text-sm'>{label}</div>
              </div>
              <Menu
                trigger={
                  <button
                    className='absolute top-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent opacity-50 outline-hidden hover:bg-surface-hover hover:opacity-100'
                    aria-label='Manage this meeting series group'
                  >
                    <MoreVert className='text-fg-primary text-lg' />
                  </button>
                }
              >
                <MenuContent align='end' sideOffset={4}>
                  <div className='select-none px-4 pt-1 pb-2 font-semibold text-[11px] text-fg-muted uppercase tracking-[0.08em]'>
                    {teamCount === 2
                      ? 'Applies to both teams'
                      : `Applies to all ${teamCount} teams`}
                  </div>
                  {isViewerOwner && (
                    <MenuItem onSelect={onStartNow}>
                      <PlayArrowIcon className={MENU_ITEM_ICON} />
                      Start next meeting now
                    </MenuItem>
                  )}
                  <MenuItem onSelect={() => setIsEditOpen(true)}>
                    <ReplayIcon className={MENU_ITEM_ICON} />
                    Edit recurrence settings
                  </MenuItem>
                  <MenuItem onSelect={() => setIsManageOpen(true)}>
                    <WidgetsIcon className={MENU_ITEM_ICON} />
                    Manage group
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
            <span className='wrap-break-word block pt-1 pb-2 text-fg-secondary text-sm'>
              {`Meeting series group • ${recurrenceLabel}`}
            </span>
            <div className='flex pl-1.5'>
              {allSeries.slice(0, MAX_MONOGRAMS).map((series) => (
                <div
                  key={series.id}
                  className='-ml-1.5 flex size-7 items-center justify-center rounded-full border-2 border-surface-card border-solid bg-grape-600 font-semibold text-[10px] text-white'
                >
                  {initials(series.title)}
                </div>
              ))}
              {teamCount > MAX_MONOGRAMS && (
                <div className='-ml-1.5 flex size-7 items-center justify-center rounded-full border-2 border-surface-card border-solid bg-surface-well font-semibold text-[10px] text-fg-primary'>
                  {`+${teamCount - MAX_MONOGRAMS}`}
                </div>
              )}
            </div>
          </div>
          <EditMeetingSeriesModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            seriesRef={firstSeries}
          />
          {isManageOpen && (
            <ManageMeetingSeriesGroupModalRoot
              isOpen={isManageOpen}
              onClose={() => setIsManageOpen(false)}
              seriesRefs={allSeries.map((series) => ({
                id: series.id,
                teamId: series.teamId,
                title: series.title,
                urlSlug: series.urlSlug,
                recurrenceRule: series.recurrenceRule,
                activeMeetings: series.activeMeetings,
                templateId: series.templateId ?? null
              }))}
              recurrenceLabel={recurrenceLabel}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MeetingSeriesGroupCard
