import type {JSONContent} from '@tiptap/core'
import {AutoAwesome} from '~/ui/icons'
import Ellipsis from '../../Ellipsis/Ellipsis'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'
import InspirationDraftList from './InspirationDraftList'
import InspirationUnusedIssues from './InspirationUnusedIssues'
import {NO_WORK_LINE, usedLabel} from './inspirationCopy'
import type {InspirationDraft} from './useInspirationDraft'
import type {WorkDrawerPrompt} from './WorkDrawerConsumeContext'

interface Props {
  draft: InspirationDraft | null
  meetingId: string
  teamId: string
  prompts: readonly WorkDrawerPrompt[]
  composer: TeamPromptComposerApi
  drafting: boolean
  error: string | null
}

// content arrives as a stringified tiptap doc
const parseContent = (raw: string): JSONContent => {
  try {
    return JSON.parse(raw)
  } catch {
    return {type: 'doc', content: []}
  }
}

const InspirationDraftSection = (props: Props) => {
  const {draft, meetingId, teamId, prompts, composer, drafting, error} = props
  const shownDraft = drafting ? null : draft
  const items = (shownDraft?.items ?? []).map(({id, content, promptId}) => ({
    id,
    title: null,
    content: parseContent(content),
    promptId: promptId ?? null
  }))
  const issues = shownDraft?.issues ?? []
  const unusedIssues = issues.flatMap(({unusedReason, ...issue}) =>
    unusedReason ? [{...issue, reason: unusedReason}] : []
  )
  const issueCount = issues.length
  const isEmpty = !!shownDraft && items.length === 0

  return (
    <section aria-labelledby='inspiration-draft-heading' aria-busy={drafting}>
      <div className='flex items-baseline justify-between px-4 pt-4 pb-2.5'>
        <h3
          id='inspiration-draft-heading'
          className='m-0 flex items-center gap-1.5 font-semibold text-fg-primary text-sm'
        >
          <AutoAwesome className='size-[18px] text-accent' />
          {drafting ? 'Drafting from your work' : 'Your draft'}
          {drafting && <Ellipsis />}
        </h3>
        {!drafting && (
          <span className='text-fg-muted text-xs'>
            {usedLabel(unusedIssues.length, issueCount)}
          </span>
        )}
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
        {items.length > 0 && (
          <InspirationDraftList
            items={items}
            prompts={prompts}
            meetingId={meetingId}
            teamId={teamId}
            composer={composer}
          />
        )}
        <InspirationUnusedIssues issues={unusedIssues} />
      </div>
    </section>
  )
}

export default InspirationDraftSection
