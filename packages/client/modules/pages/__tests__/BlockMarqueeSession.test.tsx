import '../../../tiptap/extensions/__tests__/installHappyDom'
import {TextSelection} from '@tiptap/pm/state'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {link, makeEditor, p} from '../../../tiptap/blockMove/__tests__/blockMoveTestHelpers'
import {
  getSelectedBlockRange,
  selectBlockRange
} from '../../../tiptap/blockSelection/blockSelectionState'
import {happyWindow} from '../../../tiptap/extensions/__tests__/installHappyDom'
import {BlockMarquee} from '../BlockMarquee'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

const fire = (
  target: EventTarget,
  type: string,
  init: NonNullable<ConstructorParameters<typeof happyWindow.PointerEvent>[1]>
) =>
  act(() => {
    target.dispatchEvent(
      new happyWindow.PointerEvent(type, {
        bubbles: true,
        pointerId: 1,
        isPrimary: true,
        ...init
      }) as unknown as Event
    )
  })

const marqueeBoxCount = () =>
  document.body.querySelectorAll('div.fixed.border-accent-strong').length

describe('BlockMarquee session', () => {
  let root: Root
  let column: HTMLElement
  let outside: HTMLElement
  let editor: ReturnType<typeof makeEditor>

  beforeEach(() => {
    document.body.innerHTML =
      '<div id="outside"></div><div id="surface" data-page-surface><div id="column"></div></div><div id="mount"></div>'
    column = document.getElementById('column')!
    outside = document.getElementById('outside')!
    editor = makeEditor(p('one'), link(7, 'Child', false), p('two'))
    column.appendChild(editor.view.dom)
    root = createRoot(document.getElementById('mount')!)
    act(() => {
      root.render(
        <BlockMarquee
          editor={editor}
          containerRef={{current: document.getElementById('surface')}}
        />
      )
    })
  })
  afterEach(() => {
    act(() => root.unmount())
  })

  const fireMouseDown = (target: Element) => {
    const event = new happyWindow.MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0
    }) as unknown as Event
    act(() => {
      target.dispatchEvent(event)
    })
    return event
  }

  test('a drag from the margin draws the box until release', async () => {
    fire(column, 'pointerdown', {button: 0, buttons: 1, clientX: 5, clientY: 5})
    fire(column, 'pointermove', {buttons: 1, clientX: 60, clientY: 60})
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(marqueeBoxCount()).toBe(1)
    fire(document.body, 'pointerup', {buttons: 0, clientX: 60, clientY: 60})
    expect(marqueeBoxCount()).toBe(0)
  })

  test('mousedown is prevented on a marquee target but not on text or ignored targets', () => {
    expect(fireMouseDown(column).defaultPrevented).toBe(true)
    expect(fireMouseDown(editor.view.dom.querySelector('p')!).defaultPrevented).toBe(false)
    const button = document.createElement('button')
    column.appendChild(button)
    expect(fireMouseDown(button).defaultPrevented).toBe(false)
  })

  test('a press released without moving places the caret and focuses the editor', () => {
    const posAtCoords = jest.spyOn(editor.view, 'posAtCoords').mockReturnValue({pos: 6, inside: -1})
    const focus = jest.spyOn(editor.view, 'focus')
    fire(column, 'pointerdown', {button: 0, buttons: 1, clientX: 5, clientY: 5})
    fire(document.body, 'pointerup', {buttons: 0, clientX: 5, clientY: 5})
    expect(posAtCoords).toHaveBeenCalled()
    expect(editor.state.selection.empty).toBe(true)
    expect(editor.state.selection.constructor.name).toBe('TextSelection')
    expect(focus).toHaveBeenCalled()
  })

  test('a press that drags does not place the caret', () => {
    const posAtCoords = jest.spyOn(editor.view, 'posAtCoords')
    const focus = jest.spyOn(editor.view, 'focus')
    fire(column, 'pointerdown', {button: 0, buttons: 1, clientX: 5, clientY: 5})
    fire(column, 'pointermove', {buttons: 1, clientX: 60, clientY: 60})
    fire(document.body, 'pointerup', {buttons: 0, clientX: 60, clientY: 60})
    expect(posAtCoords).not.toHaveBeenCalled()
    expect(focus).not.toHaveBeenCalled()
  })

  test('a press beside a link places a text caret, not a selected link', () => {
    const linkPos = editor.state.doc.child(0).nodeSize + editor.state.doc.child(1).nodeSize
    jest.spyOn(editor.view, 'posAtCoords').mockReturnValue({pos: linkPos, inside: -1})
    fire(column, 'pointerdown', {button: 0, buttons: 1, clientX: 5, clientY: 5})
    fire(document.body, 'pointerup', {buttons: 0, clientX: 5, clientY: 5})
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
  })

  test('a plain drag clears an earlier block selection, and a box over nothing selects nothing', async () => {
    const from = editor.state.doc.child(0).nodeSize
    selectBlockRange(editor, {from, to: from + editor.state.doc.child(1).nodeSize, depth: 0})
    expect(getSelectedBlockRange(editor.state)).not.toBeNull()
    fire(column, 'pointerdown', {button: 0, buttons: 1, clientX: 5, clientY: 5})
    fire(column, 'pointermove', {buttons: 1, clientX: 60, clientY: 60})
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(getSelectedBlockRange(editor.state)).toBeNull()
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
    fire(document.body, 'pointerup', {buttons: 0, clientX: 60, clientY: 60})
    expect(getSelectedBlockRange(editor.state)).toBeNull()
  })

  test('a release outside the page surface ends the session', async () => {
    fire(column, 'pointerdown', {button: 0, buttons: 1, clientX: 5, clientY: 5})
    fire(column, 'pointermove', {buttons: 1, clientX: 60, clientY: 60})
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(marqueeBoxCount()).toBe(1)
    fire(outside, 'pointerup', {buttons: 0, clientX: 60, clientY: 60})
    expect(marqueeBoxCount()).toBe(0)
    fire(column, 'pointermove', {buttons: 0, clientX: 200, clientY: 200})
    expect(marqueeBoxCount()).toBe(0)
  })

  test('a move with no button held ends the session', async () => {
    fire(column, 'pointerdown', {button: 0, buttons: 1, clientX: 5, clientY: 5})
    fire(outside, 'pointermove', {buttons: 0, clientX: 200, clientY: 200})
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(marqueeBoxCount()).toBe(0)
  })
})
