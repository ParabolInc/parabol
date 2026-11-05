import {getSchema} from '@tiptap/core'
import {EditorState} from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {keepUnownedPageLinksPlugin} from '../keepUnownedPageLinksPlugin'

const CHILD_PAGE_CODE = 7
const schema = getSchema([StarterKit, PageLinkBlockBase])

const deleteAcrossLink = (viewerAccess: string | null | undefined) => {
  const state = EditorState.create({
    doc: schema.nodeFromJSON({
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'before'}]},
        {
          type: 'pageLinkBlock',
          attrs: {pageCode: CHILD_PAGE_CODE, title: 'Child', canonical: true}
        },
        {type: 'paragraph', content: [{type: 'text', text: 'after'}]}
      ]
    }),
    plugins: [keepUnownedPageLinksPlugin(() => viewerAccess)]
  })
  // from inside "before" to inside "after"
  const nextState = state.apply(state.tr.delete(3, state.doc.content.size - 3))
  const linkCodes: number[] = []
  nextState.doc.descendants((node) => {
    if (node.type.name === 'pageLinkBlock') linkCodes.push(node.attrs.pageCode)
  })
  return {linkCodes, text: nextState.doc.textContent}
}

test('keeps a sub-page link the user cannot trash when they delete a selection around it', () => {
  expect(deleteAcrossLink('editor')).toEqual({linkCodes: [CHILD_PAGE_CODE], text: 'beer'})
})

test('deletes the link when the user owns the sub-page', () => {
  expect(deleteAcrossLink('owner')).toEqual({linkCodes: [], text: 'beer'})
})

test('keeps a sub-page link the user cannot open', () => {
  expect(deleteAcrossLink(null)).toEqual({linkCodes: [CHILD_PAGE_CODE], text: 'beer'})
})

test('leaves the link to the server when the user access is not loaded', () => {
  expect(deleteAcrossLink(undefined)).toEqual({linkCodes: [], text: 'beer'})
})
