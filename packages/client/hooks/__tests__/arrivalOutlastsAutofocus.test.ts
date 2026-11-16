import '../../tiptap/extensions/__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import StarterKit from '@tiptap/starter-kit'
import {act, createElement} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {MemoryRouter} from 'react-router'
import {setPendingArrival, takePendingArrival} from '../../tiptap/blockMove/pendingArrivals'
import {happyWindow} from '../../tiptap/extensions/__tests__/installHappyDom'
import {findSyncedBlockPositions} from '../../tiptap/extensions/pageLinkBlock/findSyncedBlockPositions'
import {isArrivalPending, useArrivalHighlight} from '../useArrivalHighlight'

jest.mock('../../tiptap/extensions/pageLinkBlock/findSyncedBlockPositions', () => ({
  findSyncedBlockPositions: jest.fn()
}))
jest.mock('../../tiptap/blockMove/findMovedBlockPositions', () => ({
  findMovedBlockPositions: jest.fn(() => [mockArrivalPos])
}))

let mockArrivalPos = 0
const scrolls: string[] = []
let root: Root | undefined
let editor: Editor | undefined

const Probe = ({activeEditor}: {activeEditor: Editor}) => {
  useArrivalHighlight(activeEditor, 'page:1')
  return null
}

const openPage = async (hash: string) => {
  editor = new Editor({
    element: document.body.appendChild(document.createElement('div')),
    extensions: [
      Document.extend({content: 'heading block*'}),
      StarterKit.configure({document: false})
    ],
    content: '<h1>Runbook</h1><p>Intro</p><p>Escalation path</p>',
    autofocus: !isArrivalPending('page:1', hash)
  })
  editor.on('transaction', ({transaction}) => {
    if (transaction.scrolledIntoView) scrolls.push('caret')
  })
  mockArrivalPos = editor.state.doc.child(0).nodeSize + editor.state.doc.child(1).nodeSize
  jest.mocked(findSyncedBlockPositions).mockReturnValue([mockArrivalPos])
  const container = document.body.appendChild(document.createElement('div'))
  root = createRoot(container)
  const activeEditor = editor
  act(() =>
    root!.render(
      createElement(
        MemoryRouter,
        {initialEntries: [`/pages/runbook-1${hash}`]},
        createElement(Probe, {activeEditor})
      )
    )
  )
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
  return editor
}

beforeEach(() => {
  scrolls.length = 0
  happyWindow.HTMLElement.prototype.scrollIntoView = function () {
    scrolls.push(`arrival:${this.textContent}`)
  }
})

afterEach(() => {
  takePendingArrival('page:1')
  act(() => root?.unmount())
  editor?.destroy()
  root = undefined
  editor = undefined
  document.body.replaceChildren()
  jest.restoreAllMocks()
})

test('a page opened at a synced block ends scrolled to that block', async () => {
  const activeEditor = await openPage('#synced-block-9')
  expect(scrolls).toEqual(['arrival:Escalation path'])
  expect(activeEditor.isFocused).toBe(false)
})

test('a page opened by Move to ends scrolled to the moved block', async () => {
  setPendingArrival('page:1', [{client: 1, clock: 1, snapshot: ''}])
  await openPage('')
  expect(scrolls).toEqual(['arrival:Escalation path'])
})

test('a page opened plainly still puts the caret in the title', async () => {
  const activeEditor = await openPage('')
  expect(scrolls).toEqual(['caret'])
  expect(activeEditor.state.selection.$from.parent.textContent).toBe('Runbook')
})
