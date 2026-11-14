import type {Editor} from '@tiptap/core'
import {DOMSerializer} from '@tiptap/pm/model'
import type {PageLinkBlockAttrs} from '../../../shared/tiptap/extensions/PageLinkBlockBase'

export const serializeSyncedBlock = (
  attrs: Pick<PageLinkBlockAttrs, 'pageCode' | 'title'>,
  content: Editor | null
) => {
  const block = document.createElement('div')
  block.setAttribute('data-id', String(attrs.pageCode))
  block.setAttribute('data-title', attrs.title ?? '')
  block.setAttribute('data-synced', '')
  block.setAttribute('data-type', 'pageLinkBlock')
  if (!content) return {html: block.outerHTML, text: ''}
  const {doc, schema} = content.state
  const nameSize = doc.firstChild?.nodeSize ?? 0
  block.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content.cut(nameSize)))
  const text = doc.textBetween(nameSize, doc.content.size, '\n')
  return {html: block.outerHTML, text}
}
