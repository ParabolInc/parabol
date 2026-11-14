import '../../__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {happyWindow} from '../../__tests__/installHappyDom'
import MoveToPageMenu from '../MoveToPageMenu'

const mockNavigate = jest.fn()
jest.mock('react-router', () => ({useNavigate: () => mockNavigate}))
jest.mock('../MoveToPageResultsRoot', () => {
  const {createElement, useEffect} = jest.requireActual('react')
  const MoveToPageMenuItem = jest.requireActual('../MoveToPageMenuItem').default
  const rows = [
    {pageId: 'page:1', title: 'Q3 Roadmap', path: 'Engineering', refusal: null, isDatabase: false},
    {pageId: 'page:2', title: 'Hiring plan', path: 'Engineering', refusal: null, isDatabase: false},
    {
      pageId: 'page:3',
      title: 'Design review',
      path: 'Shared',
      refusal: 'View only',
      isDatabase: false
    }
  ]
  type Props = {
    textFilter: string
    onPick: () => void
    onFirstAllowed: (first: {row: unknown; textFilter: string}) => void
  }
  return {
    __esModule: true,
    default: ({textFilter, onPick, onFirstAllowed}: Props) => {
      useEffect(() => onFirstAllowed({row: rows[0], textFilter}), [onFirstAllowed, textFilter])
      return rows.map((row) => createElement(MoveToPageMenuItem, {key: row.pageId, row, onPick}))
    }
  }
})

const tick = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms))

let root: Root | undefined
let onClose: jest.Mock
let onPick: jest.Mock

const render = async () => {
  onClose = jest.fn()
  onPick = jest.fn()
  const host = document.body.appendChild(document.createElement('div'))
  await act(async () => {
    root = createRoot(host)
    root.render(
      <MoveToPageMenu
        anchorRect={{top: 10, left: 10, width: 1, height: 20}}
        count={2}
        drag={{sourcePageId: 'page:0', childPageIds: [], refusal: null}}
        onClose={onClose}
        onPick={onPick}
      />
    )
    await tick(60)
  })
}

const input = () => document.querySelector<HTMLInputElement>('input[placeholder="Search pages"]')!
const rows = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'))
const content = () => document.querySelector<HTMLElement>('[role="menu"]')!
const dispatch = async (target: Element, event: Event) => {
  await act(async () => {
    target.dispatchEvent(event)
    await tick()
  })
}
const press = (target: Element, key: string, init: Record<string, unknown> = {}) =>
  dispatch(
    target,
    new happyWindow.KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...init
    }) as unknown as Event
  )
const pointer = (target: Element, type: string, init: Record<string, unknown> = {}) =>
  dispatch(
    target,
    new happyWindow.PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerType: 'mouse',
      ...init
    }) as unknown as Event
  )

afterEach(async () => {
  await act(async () => {
    root?.unmount()
    root = undefined
    await tick()
  })
  document.body.replaceChildren()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('the search box has focus when the picker opens', async () => {
  await render()
  expect(document.activeElement).toBe(input())
})

test('Enter in the search box moves to the first allowed row', async () => {
  await render()
  await press(input(), 'Enter')
  expect(onPick).toHaveBeenCalledWith('page:1', 'Q3 Roadmap', mockNavigate)
})

const typeInSearch = async (text: string) => {
  const setValue = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input()), 'value')?.set
  await act(async () => {
    setValue?.call(input(), text)
    input().dispatchEvent(new happyWindow.Event('input', {bubbles: true}) as unknown as Event)
  })
}

test('Enter before the results catch up with the typed query picks nothing', async () => {
  await render()
  await typeInSearch('Team rit')
  await press(input(), 'Enter')
  expect(onPick).not.toHaveBeenCalled()
})

test('Enter once the results match the typed query picks the first allowed row', async () => {
  await render()
  await typeInSearch('Team rit ')
  await act(async () => {
    await tick(250)
  })
  await press(input(), 'Enter')
  expect(onPick).toHaveBeenCalledWith('page:1', 'Q3 Roadmap', mockNavigate)
})

test('Enter that ends an IME composition picks nothing', async () => {
  await render()
  await press(input(), 'Enter', {isComposing: true})
  expect(onPick).not.toHaveBeenCalled()
})

test('ArrowDown reaches the first row and ArrowUp on it returns to the search box', async () => {
  await render()
  await press(input(), 'ArrowDown')
  expect(document.activeElement).toBe(rows()[0])
  await press(rows()[0]!, 'ArrowUp')
  expect(document.activeElement).toBe(input())
})

test('a printable key typed on a row goes into the search box', async () => {
  await render()
  await press(input(), 'ArrowDown')
  await press(rows()[0]!, 'r')
  expect(document.activeElement).toBe(input())
  expect(input().value).toBe('r')
})

test('rows moving under a still pointer leave the search box focused', async () => {
  await render()
  await pointer(rows()[0]!, 'pointerout', {relatedTarget: content()})
  expect(document.activeElement).toBe(input())
})

test('hovering a refused row leaves the search box focused', async () => {
  await render()
  await pointer(rows()[2]!, 'pointermove')
  expect(document.activeElement).toBe(input())
})

test('leaving a hovered row still clears its highlight', async () => {
  await render()
  await pointer(rows()[0]!, 'pointermove')
  expect(document.activeElement).toBe(rows()[0])
  await pointer(rows()[0]!, 'pointerout', {relatedTarget: content()})
  expect(document.activeElement).toBe(content())
})

test('Esc closes the picker and returns focus to the editor', async () => {
  await render()
  await press(input(), 'Escape')
  expect(onClose).toHaveBeenCalledWith(true)
})

test('a click on inert space closes the picker and returns focus to the editor', async () => {
  await render()
  const outside = document.body.appendChild(document.createElement('div'))
  await pointer(outside, 'pointerdown')
  expect(onClose).toHaveBeenCalledWith(true)
})

test('a click on a focusable control leaves focus with that control', async () => {
  await render()
  const sidebarSearch = document.body.appendChild(document.createElement('input'))
  await pointer(sidebarSearch, 'pointerdown')
  expect(onClose).toHaveBeenCalledWith(false)
})

test('a click into a comment box leaves focus there', async () => {
  await render()
  const comment = document.body.appendChild(document.createElement('div'))
  comment.setAttribute('contenteditable', 'true')
  const paragraph = comment.appendChild(document.createElement('p'))
  await pointer(paragraph, 'pointerdown')
  expect(onClose).toHaveBeenCalledWith(false)
})
