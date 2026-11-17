import '../../../tiptap/extensions/__tests__/installHappyDom'
import {act} from 'react'
import {createRoot} from 'react-dom/client'
import {happyWindow} from '../../../tiptap/extensions/__tests__/installHappyDom'
import {BlockDropHint} from '../BlockDropHint'

jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useClientQuery: () => ({viewer: {draggingPageId: 'page:9'}})
}))

Object.defineProperty(globalThis, 'DragEvent', {value: happyWindow.DragEvent, configurable: true})

test.each([
  ['a refused target', 'No pages in synced blocks', 'No pages in synced blocks'],
  ['a target that does not refuse', undefined, '']
])('a page drag over %s shows only a refusal', (_label, refusal, expected) => {
  const container = document.body.appendChild(document.createElement('div'))
  const target = document.body.appendChild(document.createElement('div'))
  target.setAttribute('data-drop-title', 'Escalation path')
  if (refusal) target.setAttribute('data-drop-refused', refusal)
  const root = createRoot(container)
  act(() => root.render(<BlockDropHint />))
  act(() => {
    target.dispatchEvent(new DragEvent('dragover', {bubbles: true}))
  })
  expect(container.textContent).toBe(expected)
  act(() => root.unmount())
  document.body.replaceChildren()
})
