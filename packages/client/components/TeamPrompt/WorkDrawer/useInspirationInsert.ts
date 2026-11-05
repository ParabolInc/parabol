import {useCallback, useRef, useState} from 'react'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'
import {
  type InspirationDraftItem,
  isItemTextInAnswer,
  runInspirationInsert
} from './inspirationInsertPlan'

export type {InspirationDraftItem}

interface Options {
  composer: TeamPromptComposerApi
}

const useInspirationInsert = (options: Options) => {
  const {composer} = options
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const addingRef = useRef(false)

  const isAdded = useCallback(
    (item: InspirationDraftItem) =>
      addedIds.has(item.id) || isItemTextInAnswer(composer.getAnswerText(item.promptId), item.text),
    [addedIds, composer]
  )

  const addItems = useCallback(
    async (items: InspirationDraftItem[]) => {
      if (addingRef.current || items.length === 0) return
      addingRef.current = true
      setAdding(true)
      await runInspirationInsert({
        items,
        insertAnswerBlocks: composer.insertAnswerBlocks,
        onAdded: (itemIds) => setAddedIds((prev) => new Set([...prev, ...itemIds]))
      })
      addingRef.current = false
      setAdding(false)
    },
    [composer]
  )

  return {addItems, isAdded, adding}
}

export default useInspirationInsert
