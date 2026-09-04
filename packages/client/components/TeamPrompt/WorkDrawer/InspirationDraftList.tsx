import type {Editor, JSONContent} from '@tiptap/core'
import {useCallback, useRef} from 'react'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'
import InspirationAddAllButton from './InspirationAddAllButton'
import InspirationDraftItemCard from './InspirationDraftItemCard'
import {collectText, itemSource} from './inspirationCopy'
import {trimTrailingEmptyParagraph} from './inspirationInsertPlan'
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
  const trackEditor = useCallback((itemId: string, editor: Editor | null) => {
    if (editor) editorsRef.current.set(itemId, editor)
    else editorsRef.current.delete(itemId)
  }, [])
  const cards = items.map((item) => {
    const prompt = destinationPrompt(prompts, item.promptId)
    return {item, prompt, draft: toDraftItem(item, prompt.id)}
  })
  const remaining = cards.filter(({draft}) => !isAdded(draft)).map(({draft}) => draft)
  const addEdited = (drafts: InspirationDraftItem[]) => {
    const drafted = drafts.filter(({blocks}) => blocks.length > 0)
    if (drafted.length === 0) return
    addItems(drafted)
  }
  const asEditedByTheReader = (draft: InspirationDraftItem) => {
    const editor = editorsRef.current.get(draft.id)
    if (!editor || editor.isDestroyed) return draft
    return {
      ...draft,
      blocks: trimTrailingEmptyParagraph(editor.getJSON().content ?? []),
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
          disabled={adding}
          onEditorChange={trackEditor}
          onAdd={() => addEdited([asEditedByTheReader(draft)])}
        />
      ))}
      <InspirationAddAllButton
        remaining={remaining.length}
        total={cards.length}
        disabled={adding}
        onClick={() => addEdited(remaining.map(asEditedByTheReader))}
      />
    </>
  )
}

export default InspirationDraftList
