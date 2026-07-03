import {CheckCircle, Link, LocationOn, People, Schedule} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {GCalEventCard_event$key} from '../../../__generated__/GCalEventCard_event.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {cn} from '../../../ui/cn'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'

interface Props {
  eventRef: GCalEventCard_event$key
}

const formatTime = (time: Date, excludeAmPm?: boolean | null) => {
  return (
    time
      .toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
      // 'XX:YY AM' -> 'XX:YYam'
      .replace(/ (PM|AM)/, excludeAmPm ? '' : '$1')
      .toLowerCase()
  )
}

const getDayDifference = (startDate: Date, endDate: Date) => {
  const startDateCopy = new Date(startDate)
  const endDateCopy = new Date(endDate)
  const startDay = new Date(startDateCopy.setHours(0, 0, 0, 0))
  const endDay = new Date(endDateCopy.setHours(0, 0, 0, 0))
  return (endDay.getTime() - startDay.getTime()) / ms('1d')
}

const formatEventTimeRange = (startDate: Date | null, endDate: Date | null) => {
  const dayDifference = startDate && endDate ? getDayDifference(startDate, endDate) : 0

  // Always show am/pm for start date unless:
  // 1. start + end times are within 3 hours of each other.
  // 2. AND start + end times are either both in the AM or both in the PM.
  const shouldAlwaysShowAmPm =
    endDate &&
    startDate &&
    endDate.getTime() - startDate.getTime() < ms('3h') &&
    ((endDate.getHours() >= 12 && startDate.getHours() >= 12) ||
      (endDate.getHours() < 12 && startDate.getHours() < 12))

  let formattedTime = ''

  if (startDate) {
    formattedTime += formatTime(startDate, shouldAlwaysShowAmPm)
  }

  if (startDate && endDate) {
    formattedTime += ' - '
  }

  if (endDate) {
    formattedTime += formatTime(endDate)
  }

  if (dayDifference > 0) {
    formattedTime += ` (+${dayDifference}d)`
  }

  return formattedTime
}

// Human-readable meeting length, e.g. '30 min' or '1h 30m'
const formatDuration = (durationMs: number) => {
  const totalMinutes = Math.round(durationMs / ms('1m'))
  if (totalMinutes < 60) return `${totalMinutes} min`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

// A longer meeting reads as a bigger time commitment, so color escalates from green -> gold -> red.
const getDurationColor = (durationMs: number) => {
  if (durationMs <= ms('30m')) return 'bg-jade-500'
  if (durationMs <= ms('60m')) return 'bg-gold-500'
  return 'bg-tomato-500'
}

const GCalEventCard = (props: Props) => {
  const {eventRef} = props

  const result = useFragment(
    graphql`
      fragment GCalEventCard_event on GcalIntegrationEvent {
        summary
        startDate
        endDate
        link
        location
        attendeeCount
      }
    `,
    eventRef
  )

  const atmosphere = useAtmosphere()

  // A single tooltip that reads "Copy link" on hover and briefly flips to "Copied!" after a copy.
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!link) return
    navigator.clipboard.writeText(link)
    trackCopy()
    setCopied(true)
    setTooltipOpen(true)
    setTimeout(() => {
      setCopied(false)
      setTooltipOpen(false)
    }, 2000)
  }

  const startDate = result.startDate ? new Date(result.startDate) : null
  const endDate = result.endDate ? new Date(result.endDate) : null
  const {summary, link, location, attendeeCount} = result

  const now = Date.now()
  const hasHappened = !!endDate && endDate.getTime() < now
  const isInProgress =
    !!startDate && !!endDate && startDate.getTime() <= now && endDate.getTime() >= now

  const durationMs =
    startDate && endDate ? Math.max(endDate.getTime() - startDate.getTime(), 0) : null
  // Scale the bar width with duration, saturating at 2h so a marathon meeting fills the track.
  const durationRatio = durationMs === null ? 0 : Math.min(durationMs / ms('2h'), 1)

  const trackLinkClick = () => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Card Link Clicked', {
      service: 'gcal'
    })
  }

  const trackCopy = () => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Card Copied', {
      service: 'gcal'
    })
  }

  return (
    <div className='rounded-sm border border-slate-300 border-solid p-4 hover:border-slate-600'>
      <div className='flex items-center gap-2 text-slate-600 text-xs'>
        {hasHappened ? (
          <CheckCircle className='h-4 w-4 text-jade-500' />
        ) : isInProgress ? (
          <span className='flex items-center gap-1 font-semibold text-forest-500'>
            <span className='h-2 w-2 rounded-full bg-forest-500' />
            Now
          </span>
        ) : (
          <Schedule className='h-4 w-4 text-sky-500' />
        )}
        <div>{formatEventTimeRange(startDate, endDate)}</div>
        {durationMs !== null && durationMs > 0 && (
          <div className='ml-auto flex shrink-0 items-center gap-2'>
            <div className='h-1.5 w-16 overflow-hidden rounded-full bg-slate-200'>
              <div
                className={cn('h-full rounded-full', getDurationColor(durationMs))}
                style={{width: `${Math.max(durationRatio * 100, 12)}%`}}
              />
            </div>
            <span>{formatDuration(durationMs)}</span>
          </div>
        )}
      </div>
      <div className='my-2 min-w-0 text-sm'>
        <a
          className='wrap-break-word hover:underline'
          href={link ?? undefined}
          target='_blank'
          rel='noreferrer'
          onClick={trackLinkClick}
        >
          {summary || '(no title)'}
        </a>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex min-w-0 items-center gap-3 text-slate-600 text-xs'>
          {!!attendeeCount && attendeeCount > 0 && (
            <div className='flex shrink-0 items-center gap-1'>
              <People className='h-4 w-4' />
              {attendeeCount}
            </div>
          )}
          {location && (
            <div className='flex min-w-0 items-center gap-1'>
              <LocationOn className='h-4 w-4 shrink-0' />
              <span className='truncate'>{location}</span>
            </div>
          )}
        </div>
        {link && (
          <Tooltip
            open={tooltipOpen}
            onOpenChange={(next) => {
              // Keep the "Copied!" confirmation up until its timeout resets it
              if (!copied) setTooltipOpen(next)
            }}
          >
            <TooltipTrigger asChild>
              <button
                type='button'
                className='shrink-0 rounded-full bg-transparent p-0 text-slate-500 hover:bg-slate-200'
                onClick={handleCopy}
              >
                <Link className='h-6 w-6 cursor-pointer p-0.5' />
              </button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied!' : 'Copy link'}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export default GCalEventCard
