import {ContentCopy} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import ms from 'ms'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useFragment} from 'react-relay'
import {GCalEventCard_event$key} from '../../../__generated__/GCalEventCard_event.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../hooks/useCoords'
import useTooltip from '../../../hooks/useTooltip'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import {mergeRefs} from '../../../utils/react/mergeRefs'

interface Props {
  eventRef: GCalEventCard_event$key
}

const formatTime = (time: Date, excludeAmPm?: boolean | null) => {
  return (
    time
      .toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true})
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

const GCalEventCard = (props: Props) => {
  const {eventRef} = props

  const result = useFragment(
    graphql`
      fragment GCalEventCard_event on GcalIntegrationEvent {
        summary
        startDate
        endDate
        link
      }
    `,
    eventRef
  )

  const atmosphere = useAtmosphere()

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  const {
    tooltipPortal: copiedTooltipPortal,
    openTooltip: openCopiedTooltip,
    closeTooltip: closeCopiedTooltip,
    originRef: copiedTooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)

  const handleCopy = () => {
    openCopiedTooltip()
    trackCopy()
    setTimeout(() => {
      closeCopiedTooltip()
    }, 2000)
  }

  const startDate = result.startDate ? new Date(result.startDate) : null
  const endDate = result.endDate ? new Date(result.endDate) : null

  const trackLinkClick = () => {
    SendClientSideEvent(atmosphere, 'Your Work Drawer Card Link Clicked', {
      service: 'gcal'
    })
  }

  const trackCopy = () => {
    SendClientSideEvent(atmosphere, 'Your Work Drawer Card Copied', {
      service: 'gcal'
    })
  }

  return (
    <div className='group'>
      <div
        className={clsx(
          'rounded-sm border border-solid border-slate-300 p-4 hover:border-slate-600'
        )}
      >
        <div>
          <a
            className='hover:underline'
            href={result.link ?? undefined}
            target='_blank'
            rel='noreferrer'
            onClick={trackLinkClick}
          >
            {result.summary}
          </a>
        </div>
        <div className='flex justify-between text-sm text-slate-600'>
          {formatEventTimeRange(startDate, endDate)}
          <CopyToClipboard text={result.summary} onCopy={handleCopy}>
            <div
              className='hidden h-5 cursor-pointer rounded-full bg-transparent p-0 text-slate-500 group-hover:block hover:text-slate-600'
              onMouseEnter={openTooltip}
              onMouseLeave={closeTooltip}
              ref={mergeRefs(originRef, copiedTooltipRef)}
            >
              <ContentCopy className='h-5 w-5 p-0.5' />
            </div>
          </CopyToClipboard>
        </div>
      </div>
      {tooltipPortal('Copy title')}
      {copiedTooltipPortal('Copied!')}
    </div>
  )
}

export default GCalEventCard
