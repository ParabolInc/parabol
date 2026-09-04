import type {ReactNode} from 'react'
import {KeyboardArrowLeft} from '~/ui/icons'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'
import InspirationBrowseRow from './InspirationBrowseRow'
import InspirationDraftHeader from './InspirationDraftHeader'
import InspirationDraftList, {type InspirationItemData} from './InspirationDraftList'
import {formatSince} from './inspirationCopy'
import type {WorkDrawerPrompt} from './WorkDrawerConsumeContext'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Props {
  meetingId: string
  teamId: string
  service: string
  items: InspirationItemData[]
  prompts: readonly WorkDrawerPrompt[]
  composer: TeamPromptComposerApi
  workItemCount?: number
  dateRange?: WorkDrawerDateRange
  onRegenerate: () => void
  regenerating: boolean
  error: string | null
  onTune: () => void
  tuneDirty: boolean
  children?: ReactNode
}

const InspirationDraftPanel = (props: Props) => {
  const {meetingId, teamId, service, items, prompts, composer, workItemCount, dateRange} = props
  const {onRegenerate, regenerating, error, onTune, tuneDirty, children} = props
  const [browsing, setBrowsing] = useSessionStorageState<boolean>(
    `Inspiration:browse:${meetingId}:${service}`,
    false
  )

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {browsing ? (
        <button
          type='button'
          onClick={() => setBrowsing(false)}
          className='flex h-10 shrink-0 cursor-pointer items-center gap-1 px-3 font-semibold text-[13px] text-fg-secondary hover:bg-surface-hover'
        >
          <KeyboardArrowLeft className='h-5 w-5' />
          Your draft
        </button>
      ) : (
        <>
          <InspirationDraftHeader
            workItemCount={workItemCount}
            since={formatSince(dateRange?.startAt)}
            promptCount={prompts.length}
            onRegenerate={onRegenerate}
            regenerating={regenerating}
            onTune={onTune}
            tuneDirty={tuneDirty}
          />
          <div className='flex flex-col gap-2.5 px-4 pb-4'>
            {error && <div className='text-fg-error text-sm'>{error}</div>}
            <InspirationDraftList
              items={items}
              prompts={prompts}
              service={service}
              meetingId={meetingId}
              teamId={teamId}
              composer={composer}
            />
            <InspirationBrowseRow
              workItemCount={workItemCount}
              dateRange={dateRange}
              onClick={() => setBrowsing(true)}
            />
          </div>
        </>
      )}
      {/* kept mounted so the results subtree keeps reporting its work item count */}
      <div className={browsing ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>{children}</div>
    </div>
  )
}

export default InspirationDraftPanel
