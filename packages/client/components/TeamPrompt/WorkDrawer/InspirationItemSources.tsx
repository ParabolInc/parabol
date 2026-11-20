import {useState} from 'react'
import {KeyboardArrowDown, KeyboardArrowRight} from '~/ui/icons'
import InspirationIssueRow from './InspirationIssueRow'
import inspirationIssueKey from './inspirationIssueKey'
import inspirationKindLabel from './inspirationKindLabel'
import type {InspirationDraft} from './useInspirationDraft'

interface Props {
  issues: InspirationDraft['items'][number]['issues']
}

const InspirationItemSources = (props: Props) => {
  const {issues} = props
  const [expanded, setExpanded] = useState(false)
  const Arrow = expanded ? KeyboardArrowDown : KeyboardArrowRight
  return (
    <div className='flex flex-col'>
      <button
        type='button'
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className='flex h-7 cursor-pointer items-center gap-0.5 self-start rounded-md pr-1.5 font-semibold text-fg-secondary text-xs hover:bg-surface-hover hover:text-fg-primary'
      >
        <Arrow className='size-4' />
        Based on {issues.length === 1 ? '1 item' : `${issues.length} items`}
      </button>
      {expanded && (
        <ul className='m-0 flex list-none flex-col p-0'>
          {issues.map((issue) => (
            <InspirationIssueRow
              key={inspirationIssueKey(issue)}
              service={issue.service}
              title={issue.title}
              url={issue.url}
              updatedAt={issue.updatedAt}
              detail={inspirationKindLabel(issue.kind)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default InspirationItemSources
