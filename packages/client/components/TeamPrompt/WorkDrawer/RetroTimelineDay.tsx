import {useState} from 'react'
import inspirationIssueKey from './inspirationIssueKey'
import RetroTimelineEvent from './RetroTimelineEvent'
import type {InspirationDraft} from './useInspirationDraft'

// A busy day shows its most notable work and folds the rest away
const SHOWN_PER_DAY = 5
// Folding fewer than this many items would save less room than the button takes
const MIN_HIDDEN = 3

interface Props {
  label: string
  issues: InspirationDraft['issues']
  draftedKeys: ReadonlySet<string>
}

const RetroTimelineDay = (props: Props) => {
  const {label, issues, draftedKeys} = props
  const [isExpanded, setIsExpanded] = useState(false)
  const hiddenCount = issues.length - SHOWN_PER_DAY
  const isFolded = !isExpanded && hiddenCount >= MIN_HIDDEN
  const shownIssues = isFolded ? issues.slice(0, SHOWN_PER_DAY) : issues
  return (
    <div className='flex flex-col'>
      <h4 className='m-0 pt-3.5 pb-1.5 font-semibold text-fg-secondary text-xs'>{label}</h4>
      <ul className='m-0 flex list-none flex-col p-0'>
        {shownIssues.map((issue) => {
          const issueKey = inspirationIssueKey(issue)
          return (
            <RetroTimelineEvent
              key={`${issueKey}:${issue.updatedAt}`}
              issue={issue}
              isDrafted={draftedKeys.has(issueKey)}
            />
          )
        })}
      </ul>
      {isFolded && (
        <button
          type='button'
          aria-expanded={false}
          onClick={() => setIsExpanded(true)}
          className='ml-5 flex h-8 cursor-pointer items-center self-start rounded-md px-1.5 font-semibold text-fg-secondary text-xs hover:bg-surface-hover hover:text-fg-primary'
        >
          … and {hiddenCount} more
        </button>
      )}
    </div>
  )
}

export default RetroTimelineDay
