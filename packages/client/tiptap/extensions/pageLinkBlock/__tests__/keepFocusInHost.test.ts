import '../../__tests__/installHappyDom'
import {keepFocusInHost} from '../keepFocusInHost'

const makeBlock = (withEditor: boolean) => {
  const block = document.createElement('div')
  block.contentEditable = 'false'
  if (withEditor) block.appendChild(document.createElement('div')).dataset.syncedEditor = ''
  return block
}

const nextMicrotask = () => new Promise<void>((resolve) => queueMicrotask(resolve))

test('a synced block is editable until the next microtask, then restored', async () => {
  const block = makeBlock(true)
  keepFocusInHost(block)
  expect(block.contentEditable).toBe('true')
  await nextMicrotask()
  expect(block.contentEditable).toBe('false')
})

test('holding a block twice in one task still restores it', async () => {
  const block = makeBlock(true)
  keepFocusInHost(block)
  keepFocusInHost(block)
  await nextMicrotask()
  await nextMicrotask()
  expect(block.contentEditable).toBe('false')
})

test('a block without a nested editor is left alone', () => {
  const block = makeBlock(false)
  keepFocusInHost(block)
  expect(block.contentEditable).toBe('false')
  keepFocusInHost(null)
})
