import '../../__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {SyncedBlockBar} from '../SyncedBlockBar'
import {SyncedBlockPlaceRow} from '../SyncedBlockPlaceRow'
import {SyncedBlockPlacesMenu} from '../SyncedBlockPlacesMenu'

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => jest.fn()
}))

const OPAQUE_TINT = 'bg-[color-mix(in_srgb,currentColor_18%,var(--color-surface-modal))]'

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

const tagNamed = (text: string) =>
  Array.from(container.querySelectorAll('span')).find((span) => span.textContent === text)!

test('the places list tags use secondary text on a tint that ignores the row hover', () => {
  act(() =>
    root.render(
      <SyncedBlockPlaceRow
        row={{
          pageId: 'page:1',
          title: 'Handbook',
          isOriginal: true,
          isThisPage: true,
          isInTrash: false
        }}
      />
    )
  )
  const tag = tagNamed('This page')
  expect(tag.classList).toContain('text-fg-secondary')
  expect(tag.classList).not.toContain('text-fg-muted')
  expect(tag.classList).toContain(OPAQUE_TINT)
})

test('the In Trash line stays readable on a hovered row', () => {
  act(() =>
    root.render(
      <SyncedBlockPlaceRow
        row={{
          pageId: 'page:1',
          title: 'Handbook',
          isOriginal: false,
          isThisPage: true,
          isInTrash: true
        }}
      />
    )
  )
  const inTrash = tagNamed('In Trash')
  expect(inTrash.classList).toContain('text-fg-secondary')
  expect(inTrash.classList).not.toContain('text-fg-muted')
})

const renderPlacesMenu = (isViewOnly: boolean) =>
  act(() =>
    root.render(
      <SyncedBlockPlacesMenu label='Also on 1 page' isViewOnly={isViewOnly} onOpenChange={() => {}}>
        {null}
      </SyncedBlockPlacesMenu>
    )
  )

test('the view-only places button turns to primary text on its hover fill', () => {
  renderPlacesMenu(true)
  expect(container.querySelector('button')!.classList).toContain('hover:text-fg-primary')
})

test('the editable places button keeps its colors', () => {
  renderPlacesMenu(false)
  expect(container.querySelector('button')!.classList).not.toContain('hover:text-fg-primary')
})

test('the bar keeps its own Original tag and Copy and sync button', () => {
  act(() =>
    root.render(
      <SyncedBlockBar
        name='Sev 1'
        isOriginal
        isViewOnly={false}
        places={null}
        more={null}
        onCopy={() => {}}
      />
    )
  )
  const tag = tagNamed('Original')
  expect(tag.classList).not.toContain('text-fg-secondary')
  expect(tag.classList).not.toContain(OPAQUE_TINT)
  const copy = Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent?.includes('Copy and sync')
  )!
  expect(copy.classList).not.toContain('hover:text-fg-primary')
})
