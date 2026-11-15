import {TiptapTransformer} from '@hocuspocus/transformer'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {setPageLinkTitles} from '../setPageLinkTitles'

const docWithLinks = () =>
  TiptapTransformer.toYdoc(
    {
      type: 'doc',
      content: [
        {type: 'pageLinkBlock', attrs: {pageCode: 7, title: 'Escalation', synced: true}},
        {type: 'pageLinkBlock', attrs: {pageCode: 7, title: 'Old'}},
        {type: 'pageLinkBlock', attrs: {pageCode: 8, title: 'Other'}}
      ]
    },
    'default',
    serverTipTapExtensions
  )

const titles = (doc: ReturnType<typeof docWithLinks>) =>
  (TiptapTransformer.fromYdoc(doc, 'default').content ?? []).map(
    (node: {attrs?: {title?: string}}) => node.attrs?.title
  )

test('sets the title on every link to the page', () => {
  const doc = docWithLinks()
  setPageLinkTitles(doc.getXmlFragment('default'), 7, 'Escalation path')
  expect(titles(doc).slice(0, 2)).toEqual(['Escalation path', 'Escalation path'])
})

test('leaves links to other pages alone', () => {
  const doc = docWithLinks()
  setPageLinkTitles(doc.getXmlFragment('default'), 7, 'Escalation path')
  expect(titles(doc)[2]).toBe('Other')
})
