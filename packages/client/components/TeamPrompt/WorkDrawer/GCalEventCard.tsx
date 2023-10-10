import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import useTooltip from '../../../hooks/useTooltip'
import {MenuPosition} from '../../../hooks/useCoords'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {GCalEventCard_event$key} from '../../../__generated__/GCalEventCard_event.graphql'
import {mergeRefs} from '../../../utils/react/mergeRefs'
import clsx from 'clsx'
import {ContentCopy} from '@mui/icons-material'

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
  return (endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)
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
    setTimeout(() => {
      closeCopiedTooltip()
    }, 2000)
  }

  const startDate = result.startDate ? new Date(result.startDate) : null
  const endDate = result.endDate ? new Date(result.endDate) : null

  const dayDifference = startDate && endDate ? getDayDifference(startDate, endDate) : 0

  // Always show am/pm for start date unless:
  // 1. start + end times are within 3 hours of each other.
  // 2. AND start + end times are either both in the AM or both in the PM.
  const shouldAlwaysShowAmPm =
    endDate &&
    startDate &&
    endDate.getTime() - startDate.getTime() < 3 * 60 * 60 * 1000 &&
    ((endDate.getHours() >= 12 && startDate.getHours() >= 12) ||
      (endDate.getHours() < 12 && startDate.getHours() < 12))

  return (
    <div className='group'>
      <div
        className={clsx('rounded border border-solid border-slate-300 p-4 hover:border-slate-600')}
      >
        <div>
          <a
            className='hover:underline'
            href={result.link ?? undefined}
            target='_blank'
            rel='noreferrer'
          >
            {result.summary}
          </a>
        </div>
        <div className='flex justify-between text-sm text-slate-600'>
          {startDate && `${formatTime(startDate, shouldAlwaysShowAmPm)}`}
          {startDate && endDate && ' - '}
          {endDate && `${formatTime(endDate)}`}
          {dayDifference > 0 && ` (+${dayDifference}d)`}
          <CopyToClipboard text={result.summary} onCopy={handleCopy}>
            <div
              className='hidden h-5 cursor-pointer rounded-full bg-transparent p-0 text-slate-500 hover:text-slate-600 group-hover:block'
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
