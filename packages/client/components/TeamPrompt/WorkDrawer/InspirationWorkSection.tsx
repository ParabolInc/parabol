import Ellipsis from '../../Ellipsis/Ellipsis'
import InspirationIssueRow from './InspirationIssueRow'
import {NO_WORK_LINE} from './inspirationCopy'
import sortInspirationIssues from './sortInspirationIssues'
import type {InspirationDraft} from './useInspirationDraft'

interface Props {
  draft: InspirationDraft | null
  drafting: boolean
  error: string | null
  aiOffMessage: string
}

const InspirationWorkSection = (props: Props) => {
  const {draft, drafting, error, aiOffMessage} = props
  const issues = drafting ? [] : (draft?.issues ?? [])
  const isEmpty = !!draft && !drafting && issues.length === 0
  return (
    <section aria-labelledby='inspiration-work-heading' aria-busy={drafting}>
      <div className='flex flex-col gap-1 px-4 pt-4 pb-2.5'>
        <h3
          id='inspiration-work-heading'
          className='m-0 flex items-center font-semibold text-fg-primary text-sm'
        >
          {drafting ? 'Finding your work' : 'Your work'}
          {drafting && <Ellipsis />}
        </h3>
        <p className='m-0 text-fg-muted text-xs'>{aiOffMessage}</p>
      </div>
      <div className='flex flex-col gap-2.5 px-4 pb-4'>
        {error && <div className='text-fg-error text-sm'>{error}</div>}
        {isEmpty && (
          <p
            role='status'
            className='m-0 rounded-md bg-surface-well px-3 py-2 text-fg-secondary text-sm'
          >
            {NO_WORK_LINE}
          </p>
        )}
        {issues.length > 0 && (
          <ul className='m-0 flex list-none flex-col p-0'>
            {sortInspirationIssues(issues).map(({service, title, url, updatedAt}) => (
              <InspirationIssueRow
                key={`${service}:${url ?? title}`}
                service={service}
                title={title}
                url={url}
                updatedAt={updatedAt}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default InspirationWorkSection
