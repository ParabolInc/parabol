import type {JSONContent} from '@tiptap/core'

export interface InspirationDraftItem {
  id: string
  promptId: string
  blocks: JSONContent[]
  text: string
}

export interface RunInspirationInsertParams {
  items: readonly InspirationDraftItem[]
  meetingId: string
  teamId: string
  insertAnswerBlocks: (promptId: string, blocks: JSONContent[]) => Promise<boolean>
  sendEvent: (event: string, options: Record<string, unknown>) => void
  onAdded: (itemIds: string[]) => void
}

export const MIN_MATCHABLE_ITEM_TEXT_LENGTH = 16

const isEmptyParagraph = (block: JSONContent) =>
  block.type === 'paragraph' && !block.content?.length

export const trimTrailingEmptyParagraphs = (blocks: JSONContent[]) => {
  let end = blocks.length
  while (end > 0 && isEmptyParagraph(blocks[end - 1]!)) end--
  return end === blocks.length ? blocks : blocks.slice(0, end)
}

export const normalizeAnswerText = (text: string) => text.replace(/\s+/g, ' ').trim()

export const isItemTextInAnswer = (answerText: string, itemText: string): boolean => {
  const normalizedItem = normalizeAnswerText(itemText)
  if (normalizedItem.length < MIN_MATCHABLE_ITEM_TEXT_LENGTH) return false
  return normalizeAnswerText(answerText).includes(normalizedItem)
}

export const runInspirationInsert = async (params: RunInspirationInsertParams): Promise<void> => {
  const {items, meetingId, teamId, insertAnswerBlocks, sendEvent, onAdded} = params

  const insertedIds: string[] = []
  for (const item of items) {
    if (item.blocks.length === 0) continue
    const inserted = await insertAnswerBlocks(item.promptId, item.blocks)
    if (!inserted) continue
    insertedIds.push(item.id)
    sendEvent('Inspiration Item Added', {promptId: item.promptId, meetingId, teamId})
  }

  if (insertedIds.length === 0) return
  if (items.length > 1) {
    sendEvent('Inspiration Add Remaining', {count: insertedIds.length, meetingId, teamId})
  }
  onAdded(insertedIds)
}
