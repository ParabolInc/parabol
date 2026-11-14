import {Link} from 'react-router'
import {Link as LinkIcon} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'

interface Props {
  meetingId: string
  meetingName: string
  topicTitle: string
  stageIdx: number
  openInNewTab: boolean
}

const CreatedInLink = ({meetingId, meetingName, topicTitle, stageIdx, openInNewTab}: Props) => {
  const url = `/meet/${meetingId}/discuss/${stageIdx + 1}`
  const label = `${topicTitle} — ${meetingName}`
  const anchorClassName =
    'ml-1 inline-flex align-middle text-fg-secondary hover:text-fg-secondary focus:text-fg-secondary'
  const icon = <LinkIcon className='size-3 cursor-pointer' />
  const link = openInNewTab ? (
    <a
      href={url}
      aria-label={label}
      className={anchorClassName}
      target='_blank'
      rel='noopener noreferrer'
    >
      {icon}
    </a>
  ) : (
    <Link to={url} aria-label={label} className={anchorClassName}>
      {icon}
    </Link>
  )
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side='bottom'>{label}</TooltipContent>
    </Tooltip>
  )
}

export default CreatedInLink
