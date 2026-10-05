import type {JSONContent} from '@tiptap/core'
import {type ReactNode, useCallback, useState} from 'react'
import {Tune as TuneIcon} from '~/ui/icons'
import type {ServiceEnum} from '../../../__generated__/useGenerateInspirationItemsMutation.graphql'
import useGenerateInspirationItemsMutation from '../../../mutations/useGenerateInspirationItemsMutation'
import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import Ellipsis from '../../Ellipsis/Ellipsis'
import type {InspirationItemData} from './InspirationDraftList'
import {NO_WORK_LINE} from './inspirationCopy'
import RetroInspirationItemCard from './RetroInspirationItemCard'

interface Props {
  meetingId: string
  service: ServiceEnum
  searchQuery: string
  initialItems: readonly {
    id: string
    title?: string | null
    content: string
    promptId?: string | null
  }[]
  hideDraftPanel?: boolean
  children?: ReactNode
}

// content arrives as a stringified tiptap doc
const parseContent = (raw: string): JSONContent => {
  try {
    return JSON.parse(raw)
  } catch {
    return {type: 'doc', content: []}
  }
}

const InspirationItemsPanel = (props: Props) => {
  const {meetingId, service, searchQuery, initialItems, hideDraftPanel, children} = props
  const [items, setItems] = useState<InspirationItemData[]>(() =>
    initialItems.map(({id, title, content, promptId}) => ({
      id,
      title: title ?? null,
      content: parseContent(content),
      promptId: promptId ?? null
    }))
  )
  const [userPrompt, setUserPrompt] = useState('')
  const [promptOpen, setPromptOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noWorkFound, setNoWorkFound] = useState(false)
  const [generateInspirationItems, submitting] = useGenerateInspirationItemsMutation()

  const onGenerate = useCallback(() => {
    if (submitting) return
    setError(null)
    setNoWorkFound(false)
    generateInspirationItems({
      variables: {
        input: {meetingId, sources: [{service, searchQuery}], userPrompt: userPrompt.trim() || null}
      },
      onError: (e) => setError(e.message),
      onCompleted: (res, errors) => {
        if (errors) {
          setError(errors[0]?.message ?? 'Something went wrong')
          return
        }
        const generated = res.generateInspirationItems?.inspirationItems ?? []
        setItems(
          generated.map(({id, title, content, promptId}) => ({
            id,
            title: title ?? null,
            content: parseContent(content),
            promptId: promptId ?? null
          }))
        )
        setNoWorkFound(generated.length === 0)
      }
    })
  }, [submitting, meetingId, service, searchQuery, userPrompt, generateInspirationItems])

  const generateLabel = 'Draft reflections from this work'
  const customInstructionsHint = 'Customize how the AI drafts your reflections'
  const customInstructionsPlaceholder = 'Tell the AI how to draft your reflections…'

  const customInstructionsDialog = (
    <Dialog isOpen={promptOpen} onClose={() => setPromptOpen(false)}>
      <DialogContent className='z-10'>
        <DialogTitle className='mb-4'>Custom instructions</DialogTitle>
        <textarea
          autoFocus
          className='min-h-32 w-full resize-y rounded-md border border-hairline-field p-2 text-fg-primary text-sm focus:border-accent focus:outline-none'
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder={customInstructionsPlaceholder}
        />
        <DialogActions>
          {userPrompt.trim() && (
            <Button variant='ghost' size='md' onClick={() => setUserPrompt('')}>
              Clear
            </Button>
          )}
          <Button variant='secondary' size='md' onClick={() => setPromptOpen(false)}>
            Done
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      {!hideDraftPanel && (
        <div className='flex flex-col gap-2 px-4 pb-4'>
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              size='md'
              className='flex-1'
              disabled={submitting}
              onClick={onGenerate}
            >
              {submitting ? <Ellipsis /> : generateLabel}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='secondary'
                  shape='icon'
                  aria-label='Customize instructions'
                  data-dirty={userPrompt.trim() ? '' : undefined}
                  className='h-9 w-9 shrink-0 p-0 data-dirty:ring-2 data-dirty:ring-sky-300'
                  disabled={submitting}
                  onClick={() => setPromptOpen(true)}
                >
                  <TuneIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{customInstructionsHint}</TooltipContent>
            </Tooltip>
          </div>
          {customInstructionsDialog}
          {error && <div className='text-fg-error text-sm'>{error}</div>}
          {noWorkFound && (
            <p role='status' className='m-0 py-2 text-fg-secondary text-sm'>
              {NO_WORK_LINE}
            </p>
          )}
          {items.map((item) => (
            <RetroInspirationItemCard
              key={item.id}
              meetingId={meetingId}
              promptId={item.promptId}
              title={item.title}
              content={item.content}
            />
          ))}
        </div>
      )}
      {children}
    </>
  )
}

export default InspirationItemsPanel
