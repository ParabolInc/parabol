import {useCallback, useRef, useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'
import {
  type InspirationDraftItem,
  isItemTextInAnswer,
  runInspirationInsert
} from './inspirationInsertPlan'
import type {WorkDrawerPrompt} from './WorkDrawerConsumeContext'

export type {InspirationDraftItem}

interface Options {
  meetingId: string
  teamId: string
  composer: TeamPromptComposerApi
  prompts: readonly WorkDrawerPrompt[]
}

const useInspirationInsert = (options: Options) => {
  const {meetingId, teamId, composer, prompts} = options
  const atmosphere = useAtmosphere()
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
        prompts,
        meetingId,
        teamId,
        insertAnswerBlocks: composer.insertAnswerBlocks,
        undoInsert: composer.undoInsert,
        forgetInsert: composer.forgetInsert,
        emitSnackbar: (snack) => atmosphere.eventEmitter.emit('addSnackbar', snack),
        sendEvent: (event, eventOptions) => SendClientSideEvent(atmosphere, event, eventOptions),
        onAdded: (itemIds) => setAddedIds((prev) => new Set([...prev, ...itemIds])),
        onRemoved: (itemIds) =>
          setAddedIds((prev) => {
            const next = new Set(prev)
            itemIds.forEach((id) => next.delete(id))
            return next
          })
      })
      addingRef.current = false
      setAdding(false)
    },
    [composer, prompts, atmosphere, meetingId, teamId]
  )

  return {addItems, isAdded, adding}
}

export default useInspirationInsert
