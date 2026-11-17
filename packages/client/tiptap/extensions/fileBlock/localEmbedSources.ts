import type {Node} from '@tiptap/pm/model'
import {Plugin} from '@tiptap/pm/state'
import {AttrStep, ReplaceAroundStep, ReplaceStep} from '@tiptap/pm/transform'
import {ySyncPluginKey} from '@tiptap/y-tiptap'

// Only assets this user added are loaded from another site or re-hosted by this client. A URL a collaborator
// planted could be a tracking pixel, and re-hosting it would spend this user's quota and access on it
const localEmbedSources = new Set<string>()
const EMBEDDABLE_NODES = new Set(['imageBlock', 'fileBlock'])

export const isLocalEmbedSource = (src: string) => localEmbedSources.has(src)

const getEmbedSrc = (node: Node) =>
  EMBEDDABLE_NODES.has(node.type.name) && typeof node.attrs.src === 'string'
    ? (node.attrs.src as string)
    : null

export const localEmbedSourcesPlugin = new Plugin({
  appendTransaction(transactions) {
    transactions.forEach((tr) => {
      if (tr.getMeta(ySyncPluginKey)?.isChangeOrigin) return
      const removedSrcs = new Set<string>()
      const addedSrcs: string[] = []
      tr.steps.forEach((step, idx) => {
        if (step instanceof ReplaceStep || step instanceof ReplaceAroundStep) {
          tr.docs[idx]!.nodesBetween(step.from, step.to, (node) => {
            const src = getEmbedSrc(node)
            if (src !== null) removedSrcs.add(src)
          })
          step.slice.content.descendants((node) => {
            const src = getEmbedSrc(node)
            if (src !== null) addedSrcs.push(src)
          })
        } else if (
          step instanceof AttrStep &&
          step.attr === 'src' &&
          typeof step.value === 'string'
        ) {
          addedSrcs.push(step.value)
        }
      })
      // a drag deletes the block and inserts it again, which moves someone else's asset rather than adding it
      addedSrcs.forEach((src) => {
        if (!removedSrcs.has(src)) localEmbedSources.add(src)
      })
    })
    return null
  }
})
