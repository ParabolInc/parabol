import '../../__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {Focus} from '@tiptap/extensions'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {happyWindow} from '../../__tests__/installHappyDom'
import DragHandleMenu from '../../DragHandleMenu'

type Json = Record<string, unknown>
const p = (text = ''): Json => ({type: 'paragraph', content: text ? [{type: 'text', text}] : []})
const h = (level: number, text: string): Json => ({
  type: 'heading',
  attrs: {level},
  content: [{type: 'text', text}]
})
const ul = (...items: string[]): Json => ({
  type: 'bulletList',
  content: items.map((text) => ({type: 'listItem', content: [p(text)]}))
})
const image: Json = {type: 'imageBlock', attrs: {src: 'https://example.com/a.png'}}
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
  ),
  Focus
]

const tick = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms))

let root: Root | undefined
let editor: Editor | undefined

const openMenu = async (
  blocks: Json[],
  {pos = TITLE_SIZE, canCreateSubPage = true}: {pos?: number; canCreateSubPage?: boolean} = {}
) => {
  const activeEditor = new Editor({
    element: document.body.appendChild(document.createElement('div')),
    extensions,
    content: {type: 'doc', content: [h(1, 'Title'), ...blocks]}
  })
  editor = activeEditor
  const node = activeEditor.state.doc.nodeAt(pos)
  if (!node) throw new Error(`No node at ${pos}`)
  const host = document.createElement('div')
  document.body.appendChild(host)
  const anchor = document.createElement('div')
  document.body.appendChild(anchor)
  const onClose = jest.fn()
  await act(async () => {
    root = createRoot(host)
    root.render(
      <DragHandleMenu
        editor={activeEditor}
        node={node}
        pos={pos}
        onClose={onClose}
        anchorElement={anchor}
        canCreateSubPage={canCreateSubPage}
      />
    )
    await tick()
  })
  return {activeEditor, onClose}
}

const items = () => Array.from(document.querySelectorAll<HTMLElement>('[role^="menuitem"]'))
const itemNamed = (name: string) => {
  const item = items().find((element) => element.textContent?.startsWith(name))
  if (!item) throw new Error(`No item named ${name}`)
  return item
}
const hasItem = (name: string) => items().some((item) => item.textContent?.startsWith(name))
const radios = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'))
const checkedRows = () =>
  radios()
    .filter((row) => row.getAttribute('aria-checked') === 'true')
    .map((row) => row.textContent)
const caption = () =>
  document.querySelector('[data-radix-menu-content] > div:not([role])')?.textContent ?? null
const click = async (element: HTMLElement) => {
  await act(async () => {
    element.click()
    await tick()
  })
}
const openTurnInto = () => click(itemNamed('Turn into'))
type Modifiers = {metaKey?: boolean; ctrlKey?: boolean}
const pressKey = async (element: HTMLElement, key: string, modifiers: Modifiers = {}) => {
  const event = new happyWindow.KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...modifiers
  })
  await act(async () => {
    element.dispatchEvent(event as unknown as Event)
    await tick()
  })
  return event
}
const blockTypes = () => {
  const types: string[] = []
  editor?.state.doc.forEach((node) => types.push(node.type.name))
  return types
}
const rootContent = () => document.querySelector<HTMLElement>('[role="menu"]')!

afterEach(async () => {
  await act(async () => {
    root?.unmount()
    root = undefined
    await tick()
  })
  editor?.destroy()
  editor = undefined
  document.body.replaceChildren()
})

const uncaught: unknown[] = []
happyWindow.addEventListener('error', (event) => {
  uncaught.push((event as unknown as {error: unknown}).error)
})

afterEach(() => {
  expect(uncaught.splice(0)).toEqual([])
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('what the menu offers', () => {
  test('a paragraph gets the caption and all eleven rows, with Text checked', async () => {
    await openMenu([p('word')])
    expect(caption()).toBe('Text')
    expect(hasItem('Duplicate block')).toBe(true)
    expect(hasItem('Delete block')).toBe(true)
    await openTurnInto()
    expect(radios().map((row) => row.textContent)).toEqual(ROW_TITLES)
    expect(checkedRows()).toEqual(['Text'])
  })

  test('a list item has no Page row and its list type is checked', async () => {
    await openMenu([ul('word')], {pos: TITLE_SIZE + 1})
    expect(caption()).toBe('Bullet list')
    await openTurnInto()
    expect(radios().some((row) => row.textContent === 'Page')).toBe(false)
    expect(checkedRows()).toEqual(['Bullet list'])
  })

  test('Page is hidden without a grant on the page', async () => {
    await openMenu([p('word')], {canCreateSubPage: false})
    await openTurnInto()
    expect(radios().map((row) => row.textContent)).toEqual(
      ROW_TITLES.filter((title) => title !== 'Page')
    )
  })

  test('a heading level with no row has no caption or check', async () => {
    await openMenu([h(4, 'word')])
    expect(caption()).toBeNull()
    await openTurnInto()
    expect(checkedRows()).toEqual([])
  })

  test('the page title only offers Duplicate', async () => {
    await openMenu([p('word')], {pos: 0})
    expect(items().map((item) => item.textContent)).toEqual([expect.stringMatching(/^Duplicate/)])
    expect(caption()).toBeNull()
  })

  test('an image keeps the menu it has today', async () => {
    await openMenu([image])
    expect(hasItem('Turn into')).toBe(false)
    expect(hasItem('Duplicate block')).toBe(true)
    expect(hasItem('Delete block')).toBe(true)
    expect(caption()).toBeNull()
  })
})

describe('picking a row', () => {
  test('converts the block', async () => {
    const {activeEditor} = await openMenu([p('word'), p('after')])
    await openTurnInto()
    await click(itemNamed('Heading 2'))
    expect(activeEditor.state.doc.child(1).type.name).toBe('heading')
    expect(activeEditor.state.doc.child(1).attrs.level).toBe(2)
    expect(activeEditor.state.selection.$from.parent.textContent).toBe('word')
  })

  test('picking the current type changes nothing and closes the menu', async () => {
    const {activeEditor, onClose} = await openMenu([p('word')])
    const before = activeEditor.state.doc
    await openTurnInto()
    await click(itemNamed('Text'))
    expect(activeEditor.state.doc.eq(before)).toBe(true)
    await act(async () => {
      await tick()
    })
    expect(onClose).toHaveBeenCalled()
  })

  test('Page leaves a new page link titled with the text', async () => {
    const {activeEditor} = await openMenu([p('word')])
    await openTurnInto()
    await click(itemNamed('Page'))
    const link = activeEditor.state.doc.child(1)
    expect(link.type.name).toBe('pageLinkBlock')
    expect(link.attrs).toMatchObject({pageCode: -1, title: 'word', canonical: true})
  })
})

describe('every row', () => {
  test.each([
    ['Heading 1', 'heading', 1],
    ['Heading 2', 'heading', 2],
    ['Heading 3', 'heading', 3],
    ['Page', 'pageLinkBlock', undefined],
    ['Bullet list', 'bulletList', undefined],
    ['Numbered list', 'orderedList', undefined],
    ['To-do list', 'taskList', undefined],
    ['Details', 'details', undefined],
    ['Code', 'codeBlock', undefined],
    ['Quote', 'blockquote', undefined]
  ] as [string, string, number | undefined][])(
    '%s makes the block it names',
    async (row, type, level) => {
      const {activeEditor} = await openMenu([p('word'), p('after')])
      await openTurnInto()
      await click(itemNamed(row))
      const block = activeEditor.state.doc.child(1)
      expect(block.type.name).toBe(type)
      expect(block.attrs.level).toBe(level)
    }
  )

  test('Text makes a paragraph', async () => {
    const {activeEditor} = await openMenu([h(2, 'word')])
    expect(caption()).toBe('Heading 2')
    await openTurnInto()
    await click(itemNamed('Text'))
    expect(activeEditor.state.doc.child(1).type.name).toBe('paragraph')
  })
})

describe('a new Details', () => {
  test('stays open when a frame runs before its opening timer', async () => {
    const runFrameNow = jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0)
        return 0
      })
    await openMenu([p('word'), p('after')])
    await openTurnInto()
    await click(itemNamed('Details'))
    runFrameNow.mockRestore()
    expect(document.querySelector('[data-type="details"]')?.classList).toContain('is-open')
  })

  test('keeps the caret when its longer line reaches into a closed Details', async () => {
    const elementPrototype = happyWindow.HTMLElement.prototype
    Object.defineProperty(elementPrototype, 'offsetParent', {
      configurable: true,
      get(this: HTMLElement) {
        return this.closest('[hidden]') ? null : this.parentElement
      }
    })
    const warnOfMovedCaret = jest.spyOn(console, 'warn').mockImplementation()
    const mention: Json = {type: 'pageUserMention', attrs: {id: 'user1', label: 'Jordan Husney'}}
    const closedDetails: Json = {
      type: 'details',
      attrs: {open: false},
      content: [
        {type: 'detailsSummary', content: [{type: 'text', text: 'Notes'}]},
        {type: 'detailsContent', content: [p('some hidden notes here')]}
      ]
    }
    const line = {type: 'paragraph', content: [{type: 'text', text: 'word '}, mention]}
    const {activeEditor} = await openMenu([line, closedDetails])
    activeEditor.commands.setTextSelection(TITLE_SIZE + 1)
    await openTurnInto()
    await click(itemNamed('Details'))
    warnOfMovedCaret.mockRestore()
    Reflect.deleteProperty(elementPrototype, 'offsetParent')
    const {$from} = activeEditor.state.selection
    expect($from.parent.type.name).toBe('detailsSummary')
    expect($from.parent.textContent).toBe('word Jordan Husney')
    expect($from.parentOffset).toBe($from.parent.content.size)
  })
})

describe('the handle', () => {
  test.each([
    ['an item whose list splits', true, [ul('word', 'other')], TITLE_SIZE + 1, 'Quote'],
    [
      'a block joining the list above it',
      true,
      [ul('other'), p('word')],
      TITLE_SIZE + 11,
      'Bullet list'
    ],
    ['a block replaced where it stands', false, [p('word'), p('after')], TITLE_SIZE, 'Quote']
  ] as [string, boolean, Json[], number, string][])(
    'after %s, hiding it is %s',
    async (_name, isHidden, blocks, pos, row) => {
      const {activeEditor} = await openMenu(blocks, {pos})
      const before = activeEditor.state.doc
      let hideRequests = 0
      activeEditor.on('transaction', ({transaction}) => {
        if (transaction.getMeta('hideDragHandle')) hideRequests++
      })
      await openTurnInto()
      await click(itemNamed(row))
      expect(activeEditor.state.doc.eq(before)).toBe(false)
      expect(hideRequests).toBe(isHidden ? 1 : 0)
    }
  )
})

describe('keeping the page still', () => {
  const SAFARI =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15'

  test.each([
    ['a scrolling ancestor', () => document.body],
    ['the document', () => document.documentElement]
  ] as [string, () => HTMLElement][])(
    'puts back %s when the browser scrolls to the caret',
    async (_name, getScroller) => {
      const {activeEditor} = await openMenu([p('word')])
      const scroller = getScroller()
      scroller.scrollTop = 100
      scroller.scrollLeft = 40
      const userAgent = jest
        .spyOn(happyWindow.navigator, 'userAgent', 'get')
        .mockReturnValue(SAFARI)
      const revealCaret = jest.spyOn(activeEditor.view.dom, 'focus').mockImplementationOnce(() => {
        scroller.scrollTop = 900
        scroller.scrollLeft = 300
      })
      await openTurnInto()
      await click(itemNamed('Heading 2'))
      userAgent.mockRestore()
      expect(revealCaret).toHaveBeenCalled()
      expect(scroller.scrollTop).toBe(100)
      expect(scroller.scrollLeft).toBe(40)
    }
  )

  test('holds the editor at its height until new blocks have rendered', async () => {
    const {activeEditor} = await openMenu([p('word')])
    const {dom} = activeEditor.view
    jest.spyOn(dom, 'offsetHeight', 'get').mockReturnValue(500)
    const held: [string, boolean][] = []
    const sample = () => held.push([dom.style.minHeight, !!document.querySelector('.is-open')])
    activeEditor.on('update', () => {
      sample()
      setTimeout(sample)
    })
    await openTurnInto()
    await click(itemNamed('Details'))
    expect(held).toEqual([
      ['500px', false],
      ['500px', true]
    ])
    expect(dom.style.minHeight).toBe('')
  })

  test('finishes cleanly when the editor goes away first', async () => {
    const {activeEditor} = await openMenu([p('word')])
    const {dom} = activeEditor.view
    jest.spyOn(dom, 'offsetHeight', 'get').mockReturnValue(500)
    await openTurnInto()
    const row = itemNamed('Heading 2')
    await act(async () => {
      row.click()
      expect(dom.style.minHeight).toBe('500px')
      activeEditor.destroy()
      await tick()
    })
    expect(dom.style.minHeight).toBe('')
  })
})

describe('keys', () => {
  test.each([
    ['Backspace', {}],
    ['Delete', {}],
    ['d', {metaKey: true}],
    ['d', {ctrlKey: true}]
  ] as [string, Modifiers][])(
    '%s %j inside the submenu does nothing, not even in the browser',
    async (key, modifiers) => {
      const {activeEditor} = await openMenu([p('word'), p('after')])
      const before = activeEditor.state.doc
      await openTurnInto()
      const event = await pressKey(itemNamed('Heading 2'), key, modifiers)
      expect(event.defaultPrevented).toBe(true)
      expect(activeEditor.state.doc.eq(before)).toBe(true)
    }
  )

  test('Backspace on the root menu still deletes the block', async () => {
    const {activeEditor} = await openMenu([p('word'), p('after')])
    await pressKey(rootContent(), 'Backspace')
    expect(activeEditor.state.doc.childCount).toBe(2)
    expect(activeEditor.state.doc.child(1).textContent).toBe('after')
  })

  test('Backspace on a root row still deletes the block', async () => {
    const {activeEditor} = await openMenu([p('word'), p('after')])
    await pressKey(itemNamed('Duplicate block'), 'Backspace')
    expect(activeEditor.state.doc.childCount).toBe(2)
    expect(activeEditor.state.doc.child(1).textContent).toBe('after')
  })

  test('Cmd+D on the root menu still duplicates the block', async () => {
    await openMenu([p('word')])
    const event = await pressKey(rootContent(), 'd', {metaKey: true})
    expect(event.defaultPrevented).toBe(true)
    expect(blockTypes().filter((type) => type === 'paragraph').length).toBe(2)
  })

  test('Cmd+D on a root row still duplicates the block', async () => {
    await openMenu([p('word')])
    await pressKey(itemNamed('Duplicate block'), 'd', {metaKey: true})
    expect(blockTypes().filter((type) => type === 'paragraph').length).toBe(2)
  })

  test('the title ignores Backspace, and the browser never sees it', async () => {
    const {activeEditor} = await openMenu([p('word')], {pos: 0})
    const event = await pressKey(rootContent(), 'Backspace')
    expect(event.defaultPrevented).toBe(true)
    expect(activeEditor.state.doc.child(0).textContent).toBe('Title')
  })
})

describe('a stale menu', () => {
  test('does nothing when another edit moved the block', async () => {
    const {activeEditor} = await openMenu([p('word'), p('after')])
    await openTurnInto()
    act(() => {
      const {tr, schema} = activeEditor.state
      activeEditor.view.dispatch(tr.insert(TITLE_SIZE, schema.nodeFromJSON(p('new'))))
    })
    const before = activeEditor.state.doc
    await click(itemNamed('Heading 2'))
    expect(activeEditor.state.doc.eq(before)).toBe(true)
  })

  test('does nothing when the doc shrank below its position', async () => {
    const {activeEditor} = await openMenu([p('first'), p('word')], {pos: TITLE_SIZE + 7})
    await openTurnInto()
    act(() => {
      const {tr, doc} = activeEditor.state
      activeEditor.view.dispatch(tr.delete(TITLE_SIZE, doc.content.size))
    })
    const before = activeEditor.state.doc
    await click(itemNamed('Heading 2'))
    expect(activeEditor.state.doc.eq(before)).toBe(true)
  })

  test('does nothing when the page went read-only', async () => {
    const {activeEditor} = await openMenu([p('word')])
    await openTurnInto()
    act(() => activeEditor.setEditable(false))
    const before = activeEditor.state.doc
    await click(itemNamed('Heading 2'))
    expect(activeEditor.state.doc.eq(before)).toBe(true)
  })
})
