import useRefreshInterval from '~/hooks/useRefreshInterval'
import {MenuPosition} from '../../hooks/useCoords'
import useTooltip from '../../hooks/useTooltip'
import absoluteDate from '../../utils/date/absoluteDate'
import relativeDate from '../../utils/date/relativeDate'

interface Props {
  createdAt: string | Date
  updatedAt: string | Date
}

const RELATIVE_DATES_UPDATE_INTERVAL_MS = 1000

export default function TeamPromptLastUpdatedTime({updatedAt, createdAt}: Props) {
  useRefreshInterval(RELATIVE_DATES_UPDATE_INTERVAL_MS)

  const {
    tooltipPortal: createdTimePortal,
    openTooltip: showCreatedTime,
    closeTooltip: closeCreatedTime,
    originRef: createdTimeRef
  } = useTooltip<HTMLSpanElement>(MenuPosition.UPPER_CENTER)
  const {
    tooltipPortal: updatedTimePortal,
    openTooltip: showUpdatedTime,
    closeTooltip: closeUpdatedTime,
    originRef: updatedTimeRef
  } = useTooltip<HTMLSpanElement>(MenuPosition.UPPER_CENTER)

  const isEdited = createdAt !== updatedAt
  return (
    <div className='font-semibold text-[12px] text-fg-muted'>
      <span
        className='cursor-pointer'
        onMouseEnter={showCreatedTime}
        onMouseLeave={closeCreatedTime}
        ref={createdTimeRef}
      >
        {relativeDate(createdAt)}
        {createdTimePortal(absoluteDate(createdAt))}
      </span>
      {isEdited && (
        <span
          className='cursor-pointer'
          onMouseEnter={showUpdatedTime}
          onMouseLeave={closeUpdatedTime}
          ref={updatedTimeRef}
        >
          {' · Edited'}
          {updatedTimePortal(absoluteDate(updatedAt))}
        </span>
      )}
    </div>
  )
}
