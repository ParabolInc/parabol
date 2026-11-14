import {type AnyExtension, Editor, Extension, type JSONContent} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import StarterKit from '@tiptap/starter-kit'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {SyncedBlockEdges} from '../SyncedBlockEdges'
import {syncedBlockEntryPlugin} from '../syncedBlockFocus'

const SyncedBlockEntry = Extension.create({
  name: 'syncedBlockEntry',
  addProseMirrorPlugins: () => [syncedBlockEntryPlugin()]
})

const paragraph = (text?: string) => ({
  type: 'paragraph',
  content: text ? [{type: 'text', text}] : undefined
})

const heading = (text: string) => ({
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text}]
})

export const syncedLink = {
  type: 'pageLinkBlock',
  attrs: {pageCode: 7, title: '', canonical: true, synced: true}
}
export const plainLink = {
  type: 'pageLinkBlock',
  attrs: {pageCode: 8, title: 'Other', canonical: false, synced: false}
}

export const mountHost = (content: JSONContent[]) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit, PageLinkBlockBase, SyncedBlockEntry],
    content: {type: 'doc', content}
  })

export const findLinkPositions = (host: Editor) => {
  const positions: number[] = []
  host.state.doc.descendants((node, pos) => {
    if (node.type.name === 'pageLinkBlock') positions.push(pos)
  })
  return positions
}

export const hostLinkCount = (host: Editor) => findLinkPositions(host).length

export const mountNested = (
  host: Editor,
  linkPos: number,
  contentLines: string[],
  extraExtensions: AnyExtension[] = []
) => {
  const link = host.state.doc.nodeAt(linkPos)!
  const nested = new Editor({
    element: document.createElement('div'),
    extensions: [
      Document.extend({content: 'heading block*'}),
      StarterKit.configure({document: false, undoRedo: false, trailingNode: false}),
      SyncedBlockEdges.configure({
        hostView: host.view,
        getPos: () => linkPos,
        getSize: () => link.nodeSize
      }),
      ...extraExtensions
    ],
    content: {
      type: 'doc',
      content: [heading('Escalation path'), ...contentLines.map(paragraph)]
    }
  })
  const wrapper = document.createElement('div')
  wrapper.appendChild(nested.view.dom)
  const linkDom = host.view.nodeDOM(linkPos) as HTMLElement
  linkDom.appendChild(wrapper)
  return nested
}

export const press = (editor: Editor, key: string, modifiers: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true, ...modifiers})
  return !!editor.view.someProp('handleKeyDown', (handler) => handler(editor.view, event))
}
