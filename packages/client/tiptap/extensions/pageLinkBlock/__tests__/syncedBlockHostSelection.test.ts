import '../../__tests__/installHappyDom'
import {Editor, type NodeView, type NodeViewRendererProps} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import * as Y from 'yjs'
import {PageLinkBlock} from '../PageLinkBlock'
import {findLinkPositions, mountNested, syncedLink} from './syncedBlockTestHarness'

jest.mock('../PageLinkNodeView', () => ({__esModule: true, PageLinkNodeView: () => null}))
jest.mock('@tiptap/react', () => {
  const {NodeView: TipTapNodeView} = jest.requireActual<{NodeView: typeof NodeView}>('@tiptap/core')
  class AtomNodeView extends TipTapNodeView<() => null> {
    element = document.createElement('div')
    get dom() {
      return this.element
    }
  }
  return {
    ...jest.requireActual('@tiptap/react'),
    ReactNodeViewRenderer: (component: () => null) => (props: NodeViewRendererProps) =>
      new AtomNodeView(component, props)
  }
})

type ViewWithInput = {input: {mouseDown: object | null}}

test('a click in the host ignores the caret left behind in a synced block', () => {
  const element = document.body.appendChild(document.createElement('div'))
  const host = new Editor({
    element,
    extensions: [StarterKit, PageLinkBlock.configure({yDoc: new Y.Doc()})],
    content: {
      type: 'doc',
      content: [{type: 'paragraph', content: [{type: 'text', text: 'Alpha'}]}, syncedLink]
    }
  })
  const nested = mountNested(host, findLinkPositions(host)[0]!, ['Inside the block.'])
  nested.view.dom.parentElement!.dataset.syncedEditor = ''
  host.commands.setTextSelection(3)
  getSelection()!.collapse(nested.view.dom.querySelector('p')!.firstChild!, 5)
  const {input} = host.view as unknown as ViewWithInput
  input.mouseDown = {}
  host.view.dom.focus()
  input.mouseDown = null
  expect(host.state.selection.toJSON()).toEqual({type: 'text', anchor: 3, head: 3})
  nested.destroy()
  host.destroy()
  element.remove()
})
