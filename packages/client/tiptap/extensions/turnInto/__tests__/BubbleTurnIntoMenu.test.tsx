import '../../__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {TextSelection} from '@tiptap/pm/state'
import {act, useState} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {happyWindow} from '../../__tests__/installHappyDom'
import {BubbleTurnIntoMenu} from '../BubbleTurnIntoMenu'

const mockLookupPageViewerGrant = jest.fn()
jest.mock('../../../../hooks/usePageViewerAccess', () => ({
  __esModule: true,
  lookupPageViewerGrant: (...args: unknown[]) => mockLookupPageViewerGrant(...args)
}))
jest.mock('../../../../hooks/useAtmosphere', () => ({__esModule: true, default: () => ({})}))

type Json = Record<string, unknown>
const p = (text = ''): Json => ({type: 'paragraph', content: text ? [{type: 'text', text}] : []})
const ul = (...items: string[]): Json => ({
  type: 'bulletList',
  content: items.map((text) => ({type: 'listItem', content: [p(text)]}))
})
const TITLE: Json = {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Title'}]}
const TITLE_SIZE = 7
const ROW_TITLES = [
  'Text',
  'Heading 1',
  'Heading 2',
  'Heading 3',
  'Page',
  'Bullet list',
  'Numbered list',
  'To-do list',
  'Details',
  'Code',
  'Quote'
]

const extensions = [
  Document.extend({content: 'heading block*'}),
  ...serverTipTapExtensions.map((extension) =>
    extension.name === 'starterKit'
      ? extension.configure({document: false, trailingNode: {node: 'paragraph'}})
      : extension
  )
]

const tick = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms))

let root: Root | undefined
let editor: Editor | undefined
const openChanges: boolean[] = []

const Harness = ({activeEditor}: {activeEditor: Editor}) => {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (nextOpen: boolean) => {
    openChanges.push(nextOpen)
    setOpen(nextOpen)
  }
  return (
    <BubbleTurnIntoMenu
      editor={activeEditor}
      pageId='page:1'
      open={open}
      onOpenChange={handleOpenChange}
    />
  )
}

const renderMenu = async (blocks: Json[], from: number, to: number) => {
  const activeEditor = new Editor({
    element: document.body.appendChild(document.createElement('div')),
    extensions,
    content: {type: 'doc', content: [TITLE, ...blocks]}
  })
  editor = activeEditor
  const {state} = activeEditor
  activeEditor.view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, from, to)))
  const host = document.body.appendChild(document.createElement('div'))
  await act(async () => {
    root = createRoot(host)
    root.render(<Harness activeEditor={activeEditor} />)
    await tick()
  })
  return activeEditor
}

const trigger = () => document.querySelector<HTMLElement>('button[title="Turn into"]')
const radios = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'))
const rowNamed = (name: string) => {
  const row = radios().find((element) => element.textContent === name)
  if (!row) throw new Error(`No row named ${name}`)
  return row
}
const checkedRows = () =>
  radios()
    .filter((row) => row.getAttribute('aria-checked') === 'true')
    .map((row) => row.textContent)
const pointerDown = (element: Element) =>
  element.dispatchEvent(
    new happyWindow.PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      pointerType: 'mouse'
    }) as unknown as Event
  )
const openMenu = async () => {
  await act(async () => {
    pointerDown(trigger()!)
    await tick()
  })
}
const click = async (element: HTMLElement) => {
  await act(async () => {
    element.click()
    await tick()
  })
}
const pressEscape = async (element: HTMLElement) => {
  await act(async () => {
    element.dispatchEvent(
      new happyWindow.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      }) as unknown as Event
    )
    await tick()
  })
}

beforeEach(() => {
  mockLookupPageViewerGrant.mockReturnValue('owner')
})

afterEach(async () => {
  await act(async () => {
    root?.unmount()
    root = undefined
    await tick()
  })
  editor?.destroy()
  editor = undefined
  openChanges.length = 0
  document.body.replaceChildren()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('the button', () => {
  test('names the selected block and offers every row, with it checked', async () => {
    await renderMenu([p('word')], TITLE_SIZE + 1, TITLE_SIZE + 5)
    expect(trigger()?.textContent).toBe('Text')
    expect(document.querySelector('.bg-hairline')).not.toBeNull()
    await openMenu()
    expect(radios().map((row) => row.textContent)).toEqual(ROW_TITLES)
    expect(checkedRows()).toEqual(['Text'])
  })

  test('names the list of a selected list item, which cannot become a page', async () => {
    await renderMenu([ul('word')], TITLE_SIZE + 3, TITLE_SIZE + 5)
    expect(trigger()?.textContent).toBe('Bullet list')
    await openMenu()
    expect(radios().some((row) => row.textContent === 'Page')).toBe(false)
    expect(checkedRows()).toEqual(['Bullet list'])
  })

  test('hides Page without a grant on the page', async () => {
    mockLookupPageViewerGrant.mockReturnValue(null)
    await renderMenu([p('word')], TITLE_SIZE + 1, TITLE_SIZE + 5)
    await openMenu()
    expect(mockLookupPageViewerGrant).toHaveBeenCalledWith(expect.anything(), 1)
    expect(radios().map((row) => row.textContent)).toEqual(
      ROW_TITLES.filter((title) => title !== 'Page')
    )
  })

  test('is missing when the selection spans two blocks', async () => {
    await renderMenu([p('one'), p('two')], TITLE_SIZE + 1, TITLE_SIZE + 9)
    expect(trigger()).toBeNull()
    expect(document.querySelector('.bg-hairline')).toBeNull()
  })

  test('is missing in the page title', async () => {
    await renderMenu([p('word')], 1, 6)
    expect(trigger()).toBeNull()
  })
})

describe('picking a row', () => {
  test('converts the selected block and puts the caret in it', async () => {
    const activeEditor = await renderMenu([p('word'), p('after')], TITLE_SIZE + 1, TITLE_SIZE + 5)
    await openMenu()
    await click(rowNamed('Heading 2'))
    const block = activeEditor.state.doc.child(1)
    expect(block.type.name).toBe('heading')
    expect(block.attrs.level).toBe(2)
    expect(activeEditor.state.doc.child(2).textContent).toBe('after')
    expect(activeEditor.state.selection.$from.parent).toBe(block)
    expect(activeEditor.view.hasFocus()).toBe(true)
    expect(openChanges.at(-1)).toBe(false)
  })

  test('closes the menu before the block changes', async () => {
    const activeEditor = await renderMenu([p('word')], TITLE_SIZE + 1, TITLE_SIZE + 5)
    await openMenu()
    let openWhenChanged: boolean | undefined
    activeEditor.on('update', () => {
      openWhenChanged = openChanges.at(-1)
    })
    await click(rowNamed('Quote'))
    expect(openWhenChanged).toBe(false)
  })

  test('splits the list around a selected item', async () => {
    const activeEditor = await renderMenu(
      [ul('one', 'word', 'three')],
      TITLE_SIZE + 9,
      TITLE_SIZE + 13
    )
    await openMenu()
    await click(rowNamed('Text'))
    const types: string[] = []
    activeEditor.state.doc.forEach((node) => types.push(node.type.name))
    expect(types).toEqual(['heading', 'bulletList', 'paragraph', 'bulletList', 'paragraph'])
    expect(activeEditor.state.doc.child(2).textContent).toBe('word')
  })

  test('the current type changes nothing and gives the selection back', async () => {
    const activeEditor = await renderMenu([p('word')], TITLE_SIZE + 1, TITLE_SIZE + 5)
    const before = activeEditor.state.doc
    await openMenu()
    await click(rowNamed('Text'))
    expect(activeEditor.state.doc.eq(before)).toBe(true)
    const {from, to} = activeEditor.state.selection
    expect([from, to]).toEqual([TITLE_SIZE + 1, TITLE_SIZE + 5])
    expect(activeEditor.view.hasFocus()).toBe(true)
  })

  test('changes nothing once the page is read-only', async () => {
    const activeEditor = await renderMenu([p('word')], TITLE_SIZE + 1, TITLE_SIZE + 5)
    const before = activeEditor.state.doc
    await openMenu()
    activeEditor.setEditable(false)
    await click(rowNamed('Heading 1'))
    expect(activeEditor.state.doc.eq(before)).toBe(true)
  })
})

describe('closing without a pick', () => {
  test('Escape gives the selection back to the editor', async () => {
    const activeEditor = await renderMenu([p('word')], TITLE_SIZE + 1, TITLE_SIZE + 5)
    await openMenu()
    await pressEscape(rowNamed('Heading 1'))
    await act(() => tick(50))
    expect(radios()).toEqual([])
    expect(openChanges).toEqual([true, false])
    const {from, to} = activeEditor.state.selection
    expect([from, to]).toEqual([TITLE_SIZE + 1, TITLE_SIZE + 5])
    expect(activeEditor.view.hasFocus()).toBe(true)
  })

  test('a click outside decides where focus goes', async () => {
    const activeEditor = await renderMenu([p('word')], TITLE_SIZE + 1, TITLE_SIZE + 5)
    const input = document.body.appendChild(document.createElement('input'))
    await openMenu()
    await act(async () => {
      pointerDown(input)
      expect(activeEditor.view.hasFocus()).toBe(true)
      input.focus()
      await tick(50)
    })
    expect(radios()).toEqual([])
    expect(openChanges.at(-1)).toBe(false)
    expect(document.activeElement).toBe(input)
  })

  test('the menu reports itself closed when its block stops being convertible', async () => {
    const activeEditor = await renderMenu([p('one'), p('two')], TITLE_SIZE + 1, TITLE_SIZE + 4)
    await openMenu()
    await act(async () => {
      activeEditor.commands.setTextSelection({from: TITLE_SIZE + 1, to: TITLE_SIZE + 9})
      await tick()
    })
    expect(trigger()).toBeNull()
    expect(openChanges).toEqual([true, false])
  })
})
