import type {Node} from '@tiptap/pm/model'
import {Plugin, type Transaction} from '@tiptap/pm/state'
import {Mapping, ReplaceStep} from '@tiptap/pm/transform'
import {ySyncPluginKey} from '@tiptap/y-tiptap'

export type GetPageViewerAccess = (pageCode: number) => string | null | undefined

const isCanonicalLink = (node: Node) => node.type.name === 'pageLinkBlock' && !!node.attrs.canonical

const getCanonicalLinks = (doc: Node) => {
  const links: {node: Node; pos: number}[] = []
  doc.descendants((node, pos) => {
    if (isCanonicalLink(node)) links.push({node, pos})
  })
  return links
}

const deletesCanonicalLink = (tr: Transaction) =>
  tr.steps.some((step, idx) => {
    if (!(step instanceof ReplaceStep) || step.from === step.to) return false
    let found = false
    tr.docs[idx]!.nodesBetween(step.from, step.to, (node) => {
      found ||= isCanonicalLink(node)
      return !found
    })
    return found
  })

// Deleting a selection would trash every sub-page in it, so keep the links this user cannot trash.
// When their access isn't loaded yet, the server puts the link back instead
export const keepUnownedPageLinksPlugin = (getViewerAccess: GetPageViewerAccess) =>
  new Plugin({
    appendTransaction(transactions, oldState, newState) {
      const localEdits = transactions.filter(
        (tr) => !tr.getMeta(ySyncPluginKey)?.isChangeOrigin && deletesCanonicalLink(tr)
      )
      if (localEdits.length === 0) return null
      const remainingCodes = new Set(
        getCanonicalLinks(newState.doc).map(({node}) => node.attrs.pageCode)
      )
      const linksToKeep = getCanonicalLinks(oldState.doc).filter(({node}) => {
        const {pageCode} = node.attrs
        if (remainingCodes.has(pageCode)) return false
        const viewerAccess = getViewerAccess(pageCode)
        return !!viewerAccess && viewerAccess !== 'owner'
      })
      if (linksToKeep.length === 0) return null
      const mapping = new Mapping()
      transactions.forEach((tr) => mapping.appendMapping(tr.mapping))
      const tr = newState.tr
      linksToKeep.forEach(({node, pos}) => {
        const $pos = tr.doc.resolve(tr.mapping.map(mapping.map(pos)))
        // a selection that ended mid-paragraph leaves the position inside text, so place the block after it
        tr.insert($pos.parent.inlineContent ? $pos.after() : $pos.pos, node)
      })
      return tr
    }
  })
