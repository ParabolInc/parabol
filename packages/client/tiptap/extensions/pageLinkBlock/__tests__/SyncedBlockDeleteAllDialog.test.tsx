import '../../__tests__/installHappyDom'
import {MotionGlobalConfig} from 'motion/react'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {SyncedBlockDialogRows} from '../getSyncedBlockDialogRows'
import {SyncedBlockDeleteAllDialog} from '../SyncedBlockDeleteAllDialog'

MotionGlobalConfig.skipAnimations = true

const rows: SyncedBlockDialogRows = {
  pageCount: 3,
  originalTitle: 'Runbook',
  deleteRows: [
    {key: 'page:1', icon: 'page', title: 'Runbook', isThisPage: true},
    {key: 'page:2', icon: 'page', title: 'Handbook', isThisPage: false},
    {key: 'hidden', icon: 'locked', title: "1 page you can't open", isThisPage: false}
  ],
  unsyncRows: []
}

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

test('shows the title, body and buttons in order', () => {
  render(
    <SyncedBlockDeleteAllDialog
      rows={rows}
      hostTitle='Runbook'
      isSubmitting={false}
      onConfirm={jest.fn()}
      onClose={jest.fn()}
    />
  )
  expect(dialog().querySelector('h2')?.textContent).toBe('Delete this block from 3 pages?')
  expect(dialog().textContent).toContain(
    "It disappears from every page it's on and goes to Trash. Restoring it puts it back on Runbook only."
  )
  expect(dialog().textContent).toContain('RunbookThis pageHandbook')
  expect(dialog().textContent).toContain("1 page you can't open")
  expect(buttons().map((candidate) => candidate.textContent)).toEqual(['Cancel', 'Delete all'])
})

test('says every page and disables Delete all while loading', () => {
  render(
    <SyncedBlockDeleteAllDialog
      rows={null}
      hostTitle='Runbook'
      isSubmitting={false}
      onConfirm={jest.fn()}
      onClose={jest.fn()}
    />
  )
  expect(dialog().querySelector('h2')?.textContent).toBe('Delete this block from every page?')
  expect(dialog().textContent).toContain('Restoring it puts it back on Runbook only.')
  expect(button('Delete all').disabled).toBe(true)
})

test("names the original page over this page's title once rows load", () => {
  render(
    <SyncedBlockDeleteAllDialog
      rows={rows}
      hostTitle='Handbook'
      isSubmitting={false}
      onConfirm={jest.fn()}
      onClose={jest.fn()}
    />
  )
  expect(dialog().textContent).toContain('Restoring it puts it back on Runbook only.')
})

test('falls back to the host title when no original page is openable', () => {
  render(
    <SyncedBlockDeleteAllDialog
      rows={{...rows, originalTitle: null}}
      hostTitle='Handbook'
      isSubmitting={false}
      onConfirm={jest.fn()}
      onClose={jest.fn()}
    />
  )
  expect(dialog().textContent).toContain('Restoring it puts it back on Handbook only.')
})

test('Delete all calls onConfirm', () => {
  const onConfirm = jest.fn()
  const onClose = jest.fn()
  render(
    <SyncedBlockDeleteAllDialog
      rows={rows}
      hostTitle='Runbook'
      isSubmitting={false}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
  act(() => button('Delete all').click())
  expect(onConfirm).toHaveBeenCalledTimes(1)
  act(() => button('Cancel').click())
  expect(onClose).toHaveBeenCalled()
})

test('disables Delete all while submitting', () => {
  render(
    <SyncedBlockDeleteAllDialog
      rows={rows}
      hostTitle='Runbook'
      isSubmitting
      onConfirm={jest.fn()}
      onClose={jest.fn()}
    />
  )
  expect(button('Delete all').disabled).toBe(true)
  expect(button('Cancel').disabled).toBe(false)
})
