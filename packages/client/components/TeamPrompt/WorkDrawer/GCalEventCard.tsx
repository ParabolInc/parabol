import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import useTooltip from '../../../hooks/useTooltip'
import {MenuPosition} from '../../../hooks/useCoords'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {GCalEventCard_event$key} from '../../../__generated__/GCalEventCard_event.graphql'
import {mergeRefs} from '../../../utils/react/mergeRefs'
import clsx from 'clsx'
import {CopyAll} from '@mui/icons-material'

interface Props {
  eventRef: GCalEventCard_event$key
}

const GCalEventCard = (props: Props) => {
  const {eventRef} = props

  const result = useFragment(
    graphql`
      fragment GCalEventCard_event on GcalIntegrationEvent {
        summary
        status
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
          {result.startDate &&
            `${new Date(result.startDate).getHours()}:${new Date(result.startDate)
              .getMinutes()
              .toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
              })}`}
          {result.startDate && result.endDate && ' - '}
          {result.endDate &&
            `${new Date(result.endDate).getHours()}:${new Date(result.endDate)
              .getMinutes()
              .toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
              })}`}
          <CopyToClipboard text={result.summary} onCopy={handleCopy}>
            <div
              className='h-5 cursor-pointer rounded-full bg-transparent p-0 text-slate-500 hover:hidden hover:bg-slate-200 group-hover:block'
              onMouseEnter={openTooltip}
              onMouseLeave={closeTooltip}
              ref={mergeRefs(originRef, copiedTooltipRef)}
            >
              <CopyAll className='h-5 w-5 p-0.5' />
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
