import type {JSONContent} from '@tiptap/core'
import type {Snack} from '../../Snackbar'
import type {InsertHandle} from '../structured/TeamPromptComposerApiContext'
import type {WorkDrawerPrompt} from './WorkDrawerConsumeContext'

export interface InspirationDraftItem {
  id: string
  promptId: string
  blocks: JSONContent[]
  text: string
}

export interface RunInspirationInsertParams {
  items: readonly InspirationDraftItem[]
  prompts: readonly WorkDrawerPrompt[]
  meetingId: string
  teamId: string
  insertAnswerBlocks: (promptId: string, blocks: JSONContent[]) => Promise<InsertHandle | null>
  undoInsert: (handle: InsertHandle) => boolean
  forgetInsert: (handle: InsertHandle) => void
  emitSnackbar: (snack: Snack) => void
  sendEvent: (event: string, options: Record<string, unknown>) => void
  onAdded: (itemIds: string[]) => void
  onRemoved: (itemIds: string[]) => void
}

const ADDED_TOAST_SECONDS = 7
export const MIN_MATCHABLE_ITEM_TEXT_LENGTH = 16

const isEmptyParagraph = (block: JSONContent) =>
  block.type === 'paragraph' && !block.content?.length

export const trimTrailingEmptyParagraph = (blocks: JSONContent[]) => {
  const last = blocks[blocks.length - 1]
  return last && isEmptyParagraph(last) ? blocks.slice(0, -1) : blocks
}

export const normalizeAnswerText = (text: string) => text.replace(/\s+/g, ' ').trim()

export const isItemTextInAnswer = (answerText: string, itemText: string): boolean => {
  const normalizedItem = normalizeAnswerText(itemText)
  if (normalizedItem.length < MIN_MATCHABLE_ITEM_TEXT_LENGTH) return false
  return normalizeAnswerText(answerText).includes(normalizedItem)
}

export const buildAddedToastMessage = (
  insertedCount: number,
  singleItemQuestion: string
): string | null => {
  if (insertedCount === 0) return null
  if (insertedCount === 1) return `Added to “${singleItemQuestion}”`
  return `Added ${insertedCount} answers`
}

export const runInspirationInsert = async (params: RunInspirationInsertParams): Promise<void> => {
  const {
    items,
    prompts,
    meetingId,
    teamId,
    insertAnswerBlocks,
    undoInsert,
    forgetInsert,
    emitSnackbar,
    sendEvent,
    onAdded,
    onRemoved
  } = params

  const handles: InsertHandle[] = []
  const insertedIds: string[] = []
  for (const item of items) {
    if (item.blocks.length === 0) continue
    const handle = await insertAnswerBlocks(item.promptId, item.blocks)
    if (!handle) continue
    handles.push(handle)
    insertedIds.push(item.id)
    sendEvent('Inspiration Item Added', {promptId: item.promptId, meetingId, teamId})
  }

  if (insertedIds.length > 0 && items.length > 1) {
    sendEvent('Inspiration Add Remaining', {count: insertedIds.length, meetingId, teamId})
  }

  const firstHandle = handles[0]
  if (!firstHandle) return

  onAdded(insertedIds)

  const question = prompts.find((prompt) => prompt.id === firstHandle.promptId)?.question ?? ''
  const message = buildAddedToastMessage(handles.length, question)
  if (!message) return

  let undoHandled = false
  emitSnackbar({
    key: `inspirationAdded:${firstHandle.id}`,
    message,
    autoDismiss: ADDED_TOAST_SECONDS,
    action: {
      label: 'Undo',
      callback: () => {
        if (undoHandled) return
        undoHandled = true
        const removedIds = handles.reduce<string[]>((removed, handle, index) => {
          if (undoInsert(handle)) removed.push(insertedIds[index]!)
          return removed
        }, [])
        if (removedIds.length > 0) onRemoved(removedIds)
      }
    },
    onDismiss: () => {
      if (undoHandled) return
      undoHandled = true
      handles.forEach((handle) => forgetInsert(handle))
    }
  })
}
