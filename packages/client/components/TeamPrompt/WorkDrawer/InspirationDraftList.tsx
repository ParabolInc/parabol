import type {Editor, JSONContent} from '@tiptap/core'
import {useCallback, useRef, useState} from 'react'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'
import InspirationAddAllButton from './InspirationAddAllButton'
import InspirationDraftItemCard from './InspirationDraftItemCard'
import {collectText, itemSource} from './inspirationCopy'
import {trimTrailingEmptyParagraphs} from './inspirationInsertPlan'
import useInspirationInsert, {type InspirationDraftItem} from './useInspirationInsert'
import type {WorkDrawerPrompt} from './WorkDrawerConsumeContext'

export interface InspirationItemData {
  id: string
  title: string | null
  content: JSONContent
  promptId: string | null
}

interface Props {
  items: InspirationItemData[]
  prompts: readonly WorkDrawerPrompt[]
  service: string
  meetingId: string
  teamId: string
  composer: TeamPromptComposerApi
}

const destinationPrompt = (prompts: readonly WorkDrawerPrompt[], promptId: string | null) =>
  prompts.find(({id}) => id === promptId) ?? prompts[0]!

const toDraftItem = (item: InspirationItemData, promptId: string): InspirationDraftItem => {
  const blocks = item.content.content ?? []
  return {id: item.id, promptId, blocks, text: blocks.flatMap(collectText).join(' ').trim()}
}

const InspirationDraftList = (props: Props) => {
  const {items, prompts, service, meetingId, teamId, composer} = props
  const {addItems, isAdded, adding} = useInspirationInsert({meetingId, teamId, composer, prompts})
  const editorsRef = useRef(new Map<string, Editor>())
  const [emptyIds, setEmptyIds] = useState<ReadonlySet<string>>(() => new Set())
  const trackEditor = useCallback((itemId: string, editor: Editor | null) => {
    if (editor) editorsRef.current.set(itemId, editor)
    else editorsRef.current.delete(itemId)
  }, [])
  const trackEmpty = useCallback((itemId: string, isEmpty: boolean) => {
    setEmptyIds((prev) => {
      if (prev.has(itemId) === isEmpty) return prev
      const next = new Set(prev)
      if (isEmpty) next.add(itemId)
      else next.delete(itemId)
      return next
    })
  }, [])
  const cards = items.map((item) => {
    const prompt = destinationPrompt(prompts, item.promptId)
    return {item, prompt, draft: toDraftItem(item, prompt.id)}
  })
  const drafted = cards.filter(({item}) => !emptyIds.has(item.id))
  const remaining = drafted.filter(({draft}) => !isAdded(draft)).map(({draft}) => draft)
  const addEdited = (drafts: InspirationDraftItem[]) => {
    const withContent = drafts.filter(({blocks}) => blocks.length > 0)
    if (withContent.length === 0) return
    addItems(withContent)
  }
  const asEditedByTheReader = (draft: InspirationDraftItem) => {
    const editor = editorsRef.current.get(draft.id)
    if (!editor || editor.isDestroyed) return draft
    return {
      ...draft,
      blocks: trimTrailingEmptyParagraphs(editor.getJSON().content ?? []),
      text: editor.getText().trim()
    }
  }
  return (
    <>
      {cards.map(({item, prompt, draft}) => (
        <InspirationDraftItemCard
          key={item.id}
          itemId={item.id}
          title={item.title}
          content={item.content}
          prompt={prompt}
          source={itemSource(service)}
          isAdded={isAdded(draft)}
          isEmpty={emptyIds.has(item.id)}
          disabled={adding}
          onEditorChange={trackEditor}
          onEmptyChange={trackEmpty}
          onAdd={() => addEdited([asEditedByTheReader(draft)])}
        />
      ))}
      <InspirationAddAllButton
        remaining={remaining.length}
        total={drafted.length}
        disabled={adding}
        onClick={() => addEdited(remaining.map(asEditedByTheReader))}
      />
    </>
  )
}

export default InspirationDraftList
