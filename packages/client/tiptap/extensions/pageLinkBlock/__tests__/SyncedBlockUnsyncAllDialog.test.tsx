import '../../__tests__/installHappyDom'
import {MotionGlobalConfig} from 'motion/react'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {SyncedBlockDialogRows} from '../getSyncedBlockDialogRows'
import {SyncedBlockUnsyncAllDialog} from '../SyncedBlockUnsyncAllDialog'

MotionGlobalConfig.skipAnimations = true

const unsyncRows: SyncedBlockDialogRows['unsyncRows'] = [
  {key: 'page:1', icon: 'page', title: 'Runbook', note: 'Keeps its text', isThisPage: true},
  {
    key: 'page:2',
    icon: 'removed',
    title: 'Checklist',
    note: "Block removed. 3 readers there can't see it.",
    isThisPage: false
  },
  {
    key: 'hidden',
    icon: 'locked',
    title: "1 page you can't open",
    note: 'Same rule applies',
    isThisPage: false
  }
]

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const render = (node: ReactNode) => act(() => root.render(node))
const dialog = () => document.body.querySelector<HTMLElement>('[role="dialog"]')!
const buttons = () =>
  Array.from(dialog().querySelectorAll('button')).filter((button) => button.textContent)
const button = (text: string) => buttons().find((candidate) => candidate.textContent === text)!

test('lists each page with what happens to it', () => {
  render(
    <SyncedBlockUnsyncAllDialog
      rows={unsyncRows}
      isSubmitting={false}
      onConfirm={jest.fn()}
      onClose={jest.fn()}
    />
  )
  expect(dialog().querySelector('h2')?.textContent).toBe('Unsync this block everywhere?')
  expect(dialog().textContent).toContain(
    "Each page gets its own text and later edits stop syncing. Pages where someone couldn't read it lose the block instead."
  )
  expect(dialog().textContent).toContain('RunbookKeeps its textThis page')
  expect(dialog().textContent).toContain("ChecklistBlock removed. 3 readers there can't see it.")
  expect(dialog().textContent).toContain("1 page you can't openSame rule applies")
  expect(buttons().map((candidate) => candidate.textContent)).toEqual(['Cancel', 'Unsync all'])
  expect(button('Unsync all').disabled).toBe(false)
})

test('Unsync all calls onConfirm', () => {
  const onConfirm = jest.fn()
  render(
    <SyncedBlockUnsyncAllDialog
      rows={unsyncRows}
      isSubmitting={false}
      onConfirm={onConfirm}
      onClose={jest.fn()}
    />
  )
  act(() => button('Unsync all').click())
  expect(onConfirm).toHaveBeenCalledTimes(1)
})

test('disables Unsync all while the rows load', () => {
  render(
    <SyncedBlockUnsyncAllDialog
      rows={null}
      isSubmitting={false}
      onConfirm={jest.fn()}
      onClose={jest.fn()}
    />
  )
  expect(button('Unsync all').disabled).toBe(true)
  expect(dialog().querySelector('[aria-busy="true"]')).not.toBeNull()
})
