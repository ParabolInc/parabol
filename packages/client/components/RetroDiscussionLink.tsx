import {Link} from 'react-router'

interface Props {
  meetingName: string
  topicTitle: string
  url: string
  // When true, render as a plain anchor with target="_blank" so the click doesn't navigate
  // away from the current meeting. Used inside Solo Updates / Review Tasks phases.
  openInNewTab?: boolean
}

const className =
  'block px-4 text-[14px] text-slate-700 leading-5 underline hover:underline focus:underline'

const RetroDiscussionLink = ({meetingName, topicTitle, url, openInNewTab}: Props) => {
  const label = `${meetingName} ${topicTitle}`
  const title = `${meetingName} — ${topicTitle}`
  if (openInNewTab) {
    return (
      <a href={url} title={title} className={className} target='_blank' rel='noopener noreferrer'>
        {label}
      </a>
    )
  }
  return (
    <Link to={url} title={title} className={className}>
      {label}
    </Link>
  )
}

export default RetroDiscussionLink
