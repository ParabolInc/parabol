import LinkIcon from '@mui/icons-material/Link'
import {Link} from 'react-router'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'

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
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLAnchorElement>(
    MenuPosition.UPPER_CENTER
  )
  const icon = <LinkIcon className='size-3 cursor-pointer' />
  const link = openInNewTab ? (
    <a
      href={url}
      ref={originRef}
      aria-label={label}
      className={anchorClassName}
      target='_blank'
      rel='noopener noreferrer'
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
    >
      {icon}
    </a>
  ) : (
    <Link
      to={url}
      ref={originRef}
      aria-label={label}
      className={anchorClassName}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
    >
      {icon}
    </Link>
  )
  return (
    <>
      {link}
      {tooltipPortal(<div>{label}</div>)}
    </>
  )
}

export default CreatedInLink
