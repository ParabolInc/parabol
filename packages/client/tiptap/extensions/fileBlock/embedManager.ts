import type {Editor} from '@tiptap/core'
import {commitMutation} from 'react-relay'
import type {
  AssetScopeEnum,
  useEmbedUserAssetMutation as TEmbedUserAssetMutation
} from '../../../__generated__/useEmbedUserAssetMutation.graphql'
import useEmbedUserAssetMutation from '../../../__generated__/useEmbedUserAssetMutation.graphql'
import type Atmosphere from '../../../Atmosphere'

type EmbedStatus = 'queued' | 'pending' | 'success' | 'error'

type EmbedEntry = {
  status: EmbedStatus
  attempts: number
  retryTimer?: ReturnType<typeof setTimeout>
}

// Module-level state (survives component remounts)
const embedEntries = new Map<string, EmbedEntry>()
let activeCount = 0
const MAX_CONCURRENT = 3
const MAX_RETRIES = 3
const pendingQueue: Array<{
  src: string
  execute: () => void
}> = []

const processQueue = () => {
  while (activeCount < MAX_CONCURRENT && pendingQueue.length > 0) {
    const next = pendingQueue.shift()!
    next.execute()
  }
}

const executeEmbed = (
  src: string,
  scope: AssetScopeEnum,
  scopeKey: string,
  atmosphere: Atmosphere,
  editor: Editor
) => {
  const entry = embedEntries.get(src)
  if (!entry) return
  entry.status = 'pending'
  entry.attempts++
  activeCount++

  commitMutation<TEmbedUserAssetMutation>(atmosphere, {
    mutation: useEmbedUserAssetMutation,
    variables: {url: src, scope, scopeKey},
    onCompleted: (res, errors) => {
      activeCount--
      const {embedUserAsset} = res
      const errorMessage = embedUserAsset?.error?.message ?? errors?.[0]?.message

      if (!embedUserAsset || errorMessage) {
        if (entry.attempts < MAX_RETRIES) {
          entry.status = 'queued'
          const delay = Math.pow(2, entry.attempts) * 1000
          entry.retryTimer = setTimeout(() => {
            pendingQueue.push({
              src,
              execute: () => executeEmbed(src, scope, scopeKey, atmosphere, editor)
            })
            processQueue()
          }, delay)
        } else {
          entry.status = 'error'
        }
        processQueue()
        return
      }

      const hostedUrl = embedUserAsset.url
      if (!hostedUrl) {
        entry.status = 'error'
        processQueue()
        return
      }

      entry.status = 'success'

      // Update all matching nodes in the document
      const {state, view} = editor
      state.doc.descendants((node, pos) => {
        if (
          (node.type.name === 'imageBlock' || node.type.name === 'fileBlock') &&
          node.attrs.src === src
        ) {
          const tr = state.tr.setNodeAttribute(pos, 'src', hostedUrl)
          view.dispatch(tr)
          return false
        }
        return true
      })

      processQueue()
    },
    onError: () => {
      activeCount--
      if (entry.attempts < MAX_RETRIES) {
        entry.status = 'queued'
        const delay = Math.pow(2, entry.attempts) * 1000
        entry.retryTimer = setTimeout(() => {
          pendingQueue.push({
            src,
            execute: () => executeEmbed(src, scope, scopeKey, atmosphere, editor)
          })
          processQueue()
        }, delay)
      } else {
        entry.status = 'error'
      }
      processQueue()
    }
  })
}

export const requestEmbed = (
  src: string,
  scope: AssetScopeEnum,
  scopeKey: string,
  atmosphere: Atmosphere,
  editor: Editor
) => {
  const existing = embedEntries.get(src)
  if (existing) return

  const entry: EmbedEntry = {
    status: 'queued',
    attempts: 0
  }
  embedEntries.set(src, entry)

  if (activeCount < MAX_CONCURRENT) {
    executeEmbed(src, scope, scopeKey, atmosphere, editor)
  } else {
    pendingQueue.push({
      src,
      execute: () => executeEmbed(src, scope, scopeKey, atmosphere, editor)
    })
  }
}

/** Clear all entries and pending queue. Call when navigating to a different page. */
export const clearEmbedEntries = () => {
  for (const entry of embedEntries.values()) {
    if (entry.retryTimer) clearTimeout(entry.retryTimer)
  }
  embedEntries.clear()
  pendingQueue.length = 0
  activeCount = 0
}

export const getEmbedStatus = (src: string): EmbedStatus | null => {
  return embedEntries.get(src)?.status ?? null
}
