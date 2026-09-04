import type {Editor, JSONContent} from '@tiptap/core'
import {useCallback, useRef} from 'react'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'
import InspirationAddAllButton from './InspirationAddAllButton'
import InspirationDraftItemCard from './InspirationDraftItemCard'
import {collectText, itemSource} from './inspirationCopy'
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

const toDraftItem = (item: InspirationItemData, promptId: string): InspirationDraftItem => {
  const blocks = item.content.content ?? []
  return {id: item.id, promptId, blocks, text: blocks.flatMap(collectText).join(' ').trim()}
}

const InspirationDraftList = (props: Props) => {
  const {items, prompts, service, meetingId, teamId, composer} = props
  const {addItems, isAdded, adding} = useInspirationInsert({meetingId, teamId, composer, prompts})
  const editorsRef = useRef(new Map<string, Editor>())
  const registerEditor = useCallback((itemId: string, editor: Editor) => {
    editorsRef.current.set(itemId, editor)
  }, [])
  // An item the AI left untagged, or tagged with a since-removed prompt, goes to the first question
  const cards = items.map((item) => {
    const prompt = prompts.find(({id}) => id === item.promptId) ?? prompts[0]!
    return {item, prompt, draft: toDraftItem(item, prompt.id)}
  })
  const remaining = cards.filter(({draft}) => !isAdded(draft)).map(({draft}) => draft)
  // the cards are editable, so what gets inserted is whatever the reader has left in them
  const edited = (draft: InspirationDraftItem) => {
    const editor = editorsRef.current.get(draft.id)
    if (!editor || editor.isDestroyed) return draft
    return {...draft, blocks: editor.getJSON().content ?? [], text: editor.getText().trim()}
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
          onEditorReady={registerEditor}
          onAdd={() => addItems([edited(draft)])}
        />
      ))}
      <InspirationAddAllButton
        remaining={remaining.length}
        total={cards.length}
        disabled={adding}
        onClick={() => addItems(remaining.map(edited))}
      />
    </>
  )
}

export default InspirationDraftList
