import type {Node} from '@tiptap/pm/model'
import {Plugin} from '@tiptap/pm/state'
import {AttrStep, ReplaceAroundStep, ReplaceStep} from '@tiptap/pm/transform'
import {ySyncPluginKey} from '@tiptap/y-tiptap'

// Only assets this user added are re-hosted. Re-hosting a URL a collaborator planted would fetch it on this
// user's quota and copy any Parabol asset this user can read into a page the collaborator can read
const localEmbedSources = new Set<string>()
const EMBEDDABLE_NODES = new Set(['imageBlock', 'fileBlock'])

export const isLocalEmbedSource = (src: string) => localEmbedSources.has(src)

const addSource = (node: Node) => {
  if (EMBEDDABLE_NODES.has(node.type.name) && typeof node.attrs.src === 'string') {
    localEmbedSources.add(node.attrs.src)
  }
}

export const localEmbedSourcesPlugin = new Plugin({
  appendTransaction(transactions) {
    transactions.forEach((tr) => {
      if (tr.getMeta(ySyncPluginKey)?.isChangeOrigin) return
      tr.steps.forEach((step) => {
        if (step instanceof ReplaceStep || step instanceof ReplaceAroundStep) {
          step.slice.content.descendants(addSource)
        } else if (
          step instanceof AttrStep &&
          step.attr === 'src' &&
          typeof step.value === 'string'
        ) {
          localEmbedSources.add(step.value)
        }
      })
    })
    return null
  }
})
