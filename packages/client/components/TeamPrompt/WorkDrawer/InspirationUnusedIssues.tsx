import {useState} from 'react'
import {KeyboardArrowDown, KeyboardArrowRight} from '~/ui/icons'
import InspirationIssueRow from './InspirationIssueRow'
import sortInspirationIssues from './sortInspirationIssues'

interface Props {
  issues: readonly {
    service: string
    title: string
    url?: string | null
    updatedAt?: string | null
    reason: string
  }[]
}

const InspirationUnusedIssues = ({issues}: Props) => {
  const [expanded, setExpanded] = useState(false)
  if (issues.length === 0) return null
  const Arrow = expanded ? KeyboardArrowDown : KeyboardArrowRight
  return (
    <div className='flex flex-col'>
      <button
        type='button'
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className='flex h-9 cursor-pointer items-center gap-1 rounded-md px-1 font-semibold text-fg-secondary text-sm hover:bg-surface-hover'
      >
        <Arrow className='size-5' />
        Not in the draft ({issues.length})
      </button>
      {expanded && (
        <ul className='m-0 flex list-none flex-col p-0'>
          {sortInspirationIssues(issues).map(({service, title, url, updatedAt, reason}) => (
            <InspirationIssueRow
              key={`${service}:${url ?? title}`}
              service={service}
              title={title}
              url={url}
              updatedAt={updatedAt}
              detail={reason}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default InspirationUnusedIssues
