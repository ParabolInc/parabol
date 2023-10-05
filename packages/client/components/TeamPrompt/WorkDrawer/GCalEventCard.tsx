import React from 'react'
// import CopyToClipboard from 'react-copy-to-clipboard'
import relativeDate from '../../../utils/date/relativeDate'
// import {Link} from '@mui/icons-material'
// import useTooltip from '../../../hooks/useTooltip'
// import {MenuPosition} from '../../../hooks/useCoords'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {GCalEventCard_event$key} from '../../../__generated__/GCalEventCard_event.graphql'
// import {mergeRefs} from '../../../utils/react/mergeRefs'
import clsx from 'clsx'
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

  // const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
  //   MenuPosition.UPPER_CENTER
  // )

  // const {
  //   tooltipPortal: copiedTooltipPortal,
  //   openTooltip: openCopiedTooltip,
  //   closeTooltip: closeCopiedTooltip,
  //   originRef: copiedTooltipRef
  // } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)

  // const handleCopy = () => {
  //   openCopiedTooltip()
  //   setTimeout(() => {
  //     closeCopiedTooltip()
  //   }, 2000)
  // }

  return (
    <a
      href={result.link ?? undefined}
      target='_blank'
      className={clsx('group', result.status === 'accepted' && 'font-semibold text-white')}
      rel='noreferrer'
    >
      <div
        className={clsx(
          'rounded border border-solid border-slate-300 p-4 hover:border-slate-600',
          result.status === 'accepted' && 'bg-sky-500 font-semibold text-white'
        )}
      >
        <div className='my-2 group-hover:underline'>{result.summary}</div>
        <div className='text-sm'>{result.startDate && relativeDate(result.startDate)}</div>
      </div>
    </a>
  )
}

export default GCalEventCard
