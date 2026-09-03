import useRefreshInterval from '~/hooks/useRefreshInterval'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import absoluteDate from '../../utils/date/absoluteDate'
import relativeDate from '../../utils/date/relativeDate'

interface Props {
  createdAt: string | Date
  updatedAt: string | Date
}

const RELATIVE_DATES_UPDATE_INTERVAL_MS = 1000

export default function TeamPromptLastUpdatedTime({updatedAt, createdAt}: Props) {
  useRefreshInterval(RELATIVE_DATES_UPDATE_INTERVAL_MS)

  const isEdited = createdAt !== updatedAt
  return (
    <div className='font-semibold text-[12px] text-fg-muted'>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='cursor-pointer'>{relativeDate(createdAt)}</span>
        </TooltipTrigger>
        <TooltipContent side='bottom'>{absoluteDate(createdAt)}</TooltipContent>
      </Tooltip>
      {isEdited && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='cursor-pointer'>{' · Edited'}</span>
          </TooltipTrigger>
          <TooltipContent side='bottom'>{absoluteDate(updatedAt)}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
