import type {JSONContent} from '@tiptap/core'
import type {ReactNode} from 'react'
import {KeyboardArrowLeft} from '~/ui/icons'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'
import InspirationAddAllButton from './InspirationAddAllButton'
import InspirationBrowseRow from './InspirationBrowseRow'
import InspirationDraftHeader from './InspirationDraftHeader'
import InspirationDraftItemCard from './InspirationDraftItemCard'
import {collectText, formatSince, serviceLabel} from './inspirationCopy'
import useInspirationInsert, {type InspirationDraftItem} from './useInspirationInsert'
import type {WorkDrawerPrompt} from './WorkDrawerConsumeContext'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface InspirationItemData {
  id: string
  title: string | null
  content: JSONContent
  promptId: string | null
}

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

const toDraftItem = (item: InspirationItemData, promptId: string): InspirationDraftItem => {
  const blocks = item.content.content ?? []
  return {id: item.id, promptId, blocks, text: blocks.flatMap(collectText).join(' ').trim()}
}

const InspirationDraftPanel = (props: Props) => {
  const {meetingId, teamId, service, items, prompts, composer, workItemCount, dateRange} = props
  const {onRegenerate, regenerating, error, onTune, tuneDirty, children} = props
  const [browsing, setBrowsing] = useSessionStorageState<boolean>(
    `Inspiration:browse:${meetingId}:${service}`,
    false
  )
  const {addItems, isAdded, adding} = useInspirationInsert({meetingId, teamId, composer, prompts})
  // An item the AI left untagged, or tagged with a since-removed prompt, goes to the first question
  const cards = items.map((item) => {
    const prompt = prompts.find(({id}) => id === item.promptId) ?? prompts[0]!
    return {item, prompt, draft: toDraftItem(item, prompt.id)}
  })
  const remaining = cards.filter(({draft}) => !isAdded(draft)).map(({draft}) => draft)
  const source = `${serviceLabel(service)} · Parabol`

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
            {cards.map(({item, prompt, draft}) => (
              <InspirationDraftItemCard
                key={item.id}
                title={item.title}
                content={item.content}
                prompt={prompt}
                source={source}
                isAdded={isAdded(draft)}
                disabled={adding}
                onAdd={(editor) =>
                  addItems([
                    {
                      ...draft,
                      blocks: editor.getJSON().content ?? [],
                      text: editor.getText().trim()
                    }
                  ])
                }
              />
            ))}
            <InspirationAddAllButton
              remaining={remaining.length}
              total={cards.length}
              disabled={adding}
              onClick={() => addItems(remaining)}
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
