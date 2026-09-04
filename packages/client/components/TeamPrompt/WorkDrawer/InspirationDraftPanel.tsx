import {type ReactNode, useEffect, useRef, useState} from 'react'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import InspirationSheetFooter from '../structured/mobile/InspirationSheetFooter'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'
import InspirationBrowseRow from './InspirationBrowseRow'
import InspirationDraftBackRow from './InspirationDraftBackRow'
import InspirationDraftHeader from './InspirationDraftHeader'
import InspirationDraftList, {
  type InspirationAddAllState,
  type InspirationItemData
} from './InspirationDraftList'
import type {InspirationVariant} from './InspirationPresentationContext'
import {formatSince, NO_WORK_LINE} from './inspirationCopy'
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
  noWorkFound: boolean
  onTune: () => void
  tuneDirty: boolean
  variant: InspirationVariant
  onAdded?: () => void
  filters?: ReactNode
  children?: ReactNode
}

const InspirationDraftPanel = (props: Props) => {
  const {meetingId, teamId, service, items, prompts, composer, workItemCount, dateRange} = props
  const {onRegenerate, regenerating, error, noWorkFound, onTune, tuneDirty} = props
  const {variant, onAdded, filters, children} = props
  const isSheet = variant === 'sheet'
  const [browsing, setBrowsing] = useSessionStorageState<boolean>(
    `Inspiration:browse:${meetingId}:${service}`,
    false
  )
  const [addAll, setAddAll] = useState<InspirationAddAllState>({
    remaining: 0,
    adding: false,
    addRemaining: () => {}
  })
  const backRef = useRef<HTMLButtonElement>(null)
  const browseRef = useRef<HTMLButtonElement>(null)
  const shownLevelRef = useRef(browsing)
  useEffect(() => {
    if (shownLevelRef.current === browsing) return
    shownLevelRef.current = browsing
    const landing = browsing ? backRef.current : browseRef.current
    landing?.focus()
  }, [browsing])

  const draftLevel = (
    <>
      <InspirationDraftHeader
        workItemCount={workItemCount}
        since={formatSince(dateRange?.startAt)}
        promptCount={prompts.length}
        hasItems={items.length > 0}
        onRegenerate={onRegenerate}
        regenerating={regenerating}
        onTune={onTune}
        tuneDirty={tuneDirty}
      />
      <div className='flex flex-col gap-2.5 px-4 pb-4'>
        {error && <div className='text-fg-error text-sm'>{error}</div>}
        {noWorkFound && (
          <p
            role='status'
            className='m-0 rounded-md bg-surface-well px-3 py-2 text-fg-secondary text-sm'
          >
            {NO_WORK_LINE}
          </p>
        )}
        <InspirationDraftList
          items={items}
          prompts={prompts}
          service={service}
          meetingId={meetingId}
          teamId={teamId}
          composer={composer}
          variant={variant}
          onAdded={onAdded}
          onAddAllChange={isSheet ? setAddAll : undefined}
        />
        {!isSheet && (
          <InspirationBrowseRow
            workItemCount={workItemCount}
            dateRange={dateRange}
            buttonRef={browseRef}
            onClick={() => setBrowsing(true)}
          />
        )}
      </div>
    </>
  )

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {browsing ? (
        <>
          <InspirationDraftBackRow
            variant={variant}
            buttonRef={backRef}
            onClick={() => setBrowsing(false)}
          />
          <div className='shrink-0'>{filters}</div>
        </>
      ) : isSheet ? (
        <div className='min-h-0 flex-1 overflow-y-auto'>{draftLevel}</div>
      ) : (
        draftLevel
      )}
      <div className={browsing ? 'flex min-h-0 flex-1 flex-col overflow-y-auto' : 'hidden'}>
        {children}
      </div>
      {isSheet && !browsing && (
        <InspirationSheetFooter
          onBrowse={() => setBrowsing(true)}
          onAddRemaining={addAll.addRemaining}
          remainingCount={addAll.remaining}
          adding={addAll.adding}
          browseRef={browseRef}
        />
      )}
    </div>
  )
}

export default InspirationDraftPanel
