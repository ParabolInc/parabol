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

test('sets the title on every link to the page and leaves links to other pages alone', () => {
  const doc = docWithLinks()
  setPageLinkTitles(doc.getXmlFragment('default'), 7, 'Escalation path')
  expect(titles(doc)).toEqual(['Escalation path', 'Escalation path', 'Other'])
})

test('writes nothing when the links already carry the title', () => {
  const doc = docWithLinks()
  const onUpdate = jest.fn()
  doc.on('update', onUpdate)
  setPageLinkTitles(doc.getXmlFragment('default'), 8, 'Other')
  expect(onUpdate).not.toHaveBeenCalled()
})
