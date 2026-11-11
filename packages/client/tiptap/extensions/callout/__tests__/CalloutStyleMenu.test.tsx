import '../../__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {CalloutBase} from '../../../../shared/tiptap/extensions/CalloutBase'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {happyWindow} from '../../__tests__/installHappyDom'
import DragHandleMenu from '../../DragHandleMenu'
import {Callout} from '../Callout'
import {CalloutStyleMenu} from '../CalloutStyleMenu'

type Json = Record<string, unknown>
const p = (text = ''): Json => ({type: 'paragraph', content: text ? [{type: 'text', text}] : []})
const titled = (text: string): Json => ({type: 'calloutTitle', content: [{type: 'text', text}]})
const callout = (tone: string, content: Json[], attrs: {emoji?: string} = {}): Json => ({
  type: 'callout',
  attrs: {tone, ...attrs},
  content
})
const CALLOUT_POS = 7

const extensions = [
  Document.extend({content: 'heading block*'}),
  ...serverTipTapExtensions.map((extension) => {
    if (extension.name === 'starterKit') {
      return extension.configure({document: false, trailingNode: {node: 'paragraph'}})
    }
    return extension === CalloutBase ? Callout : extension
  })
]

const tick = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms))

let root: Root | undefined
let editor: Editor | undefined

const mount = async (element: React.ReactElement) => {
  const host = document.body.appendChild(document.createElement('div'))
  await act(async () => {
    root = createRoot(host)
    root.render(element)
    await tick()
  })
}

const createEditor = (block: Json) => {
  const title = {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Title'}]}
  editor = new Editor({
    element: document.body.appendChild(document.createElement('div')),
    extensions,
    content: {type: 'doc', content: [title, block]}
  })
  return editor
}

const calloutAt = (activeEditor: Editor) => {
  const node = activeEditor.state.doc.nodeAt(CALLOUT_POS)
  if (!node) throw new Error('No callout')
  return node
}

const types = (activeEditor: Editor) => {
  const found: string[] = []
  activeEditor.state.doc.descendants((node) => {
    found.push(node.type.name)
  })
  return found
}

const click = async (element: HTMLElement) => {
  await act(async () => {
    element.click()
    await tick()
  })
}

const pressKey = async (element: HTMLElement, key: string) => {
  const event = new happyWindow.KeyboardEvent('keydown', {key, bubbles: true, cancelable: true})
  await act(async () => {
    element.dispatchEvent(event as unknown as Event)
    await tick()
  })
}

const byRole = (role: string, name: string | RegExp) =>
  Array.from(document.querySelectorAll<HTMLElement>(`[role="${role}"]`)).find((element) => {
    const label = element.getAttribute('aria-label') ?? element.textContent ?? ''
    return typeof name === 'string' ? label === name : name.test(label)
  })
const getByRole = (role: string, name: string | RegExp) => {
  const element = byRole(role, name)
  if (!element) throw new Error(`No ${role} named ${name}`)
  return element
}

const renderMenuFor = async (block: Json) => {
  const activeEditor = createEditor(block)
  const node = calloutAt(activeEditor)
  await mount(
    <CalloutStyleMenu
      editor={activeEditor}
      getPos={() => CALLOUT_POS}
      tone={node.attrs.tone}
      emoji={node.attrs.emoji}
      hasTitle={node.firstChild?.type.name === 'calloutTitle'}
    />
  )
  const trigger = document.querySelector<HTMLElement>('button[aria-haspopup="menu"]')
  if (!trigger) throw new Error('No style button')
  await pressKey(trigger, 'Enter')
  return {editor: activeEditor, trigger}
}

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

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('the style menu', () => {
  test('the icon button names the tone and opens a menu', async () => {
    const {trigger} = await renderMenuFor(callout('warning', [p('x')]))
    expect(trigger.getAttribute('aria-label')).toBe('Callout style: Warning')
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
  })

  test('picking a tone updates the callout', async () => {
    const {editor: activeEditor} = await renderMenuFor(callout('plain', [p('x')]))
    await click(getByRole('menuitemradio', 'Warning'))
    expect(calloutAt(activeEditor).attrs.tone).toBe('warning')
  })

  test('the current tone is checked', async () => {
    await renderMenuFor(callout('tip', [p('x')]))
    expect(getByRole('menuitemradio', 'Tip').getAttribute('aria-checked')).toBe('true')
  })

  test('the rows come in order', async () => {
    await renderMenuFor(callout('info', [p('x')]))
    const rows = Array.from(document.querySelectorAll('[role^="menuitem"]')).map(
      (row) => row.textContent
    )
    expect(rows).toEqual([
      'Plain',
      'Info',
      'Tip',
      'Important',
      'Warning',
      'Danger',
      'Title',
      'Use an emoji…',
      'Remove calloutKeeps what’s inside'
    ])
  })

  test('with an emoji set, the menu offers the tone icon back and not "no icon"', async () => {
    const {editor: activeEditor} = await renderMenuFor(callout('info', [p('x')], {emoji: '🚀'}))
    expect(byRole('menuitem', /no icon|remove icon/i)).toBeUndefined()
    expect(byRole('menuitem', 'Use an emoji…')).toBeUndefined()
    await click(getByRole('menuitem', 'Use the Info icon'))
    expect(calloutAt(activeEditor).attrs.emoji).toBeNull()
  })

  test('Title adds a title line', async () => {
    const {editor: activeEditor} = await renderMenuFor(callout('info', [p('x')]))
    const title = getByRole('menuitemcheckbox', 'Title')
    expect(title.getAttribute('aria-checked')).toBe('false')
    await click(title)
    expect(calloutAt(activeEditor).firstChild?.type.name).toBe('calloutTitle')
  })

  test('a set title is checked', async () => {
    await renderMenuFor(callout('info', [titled('Heads up'), p('x')]))
    expect(getByRole('menuitemcheckbox', 'Title').getAttribute('aria-checked')).toBe('true')
  })

  test('Remove callout unwraps it', async () => {
    const {editor: activeEditor} = await renderMenuFor(callout('info', [p('x')]))
    await click(getByRole('menuitem', /Remove callout/))
    expect(types(activeEditor)).not.toContain('callout')
  })

  test('a read-only page changes nothing', async () => {
    const {editor: activeEditor} = await renderMenuFor(callout('plain', [p('x')]))
    act(() => activeEditor.setEditable(false))
    await click(getByRole('menuitemradio', 'Danger'))
    expect(calloutAt(activeEditor).attrs.tone).toBe('plain')
  })
})

describe('the block handle menu', () => {
  test('a callout gets a Callout style submenu beside Turn into', async () => {
    const activeEditor = createEditor(callout('important', [p('x')]))
    await mount(
      <DragHandleMenu
        editor={activeEditor}
        node={calloutAt(activeEditor)}
        pos={CALLOUT_POS}
        onClose={jest.fn()}
        anchorElement={document.body.appendChild(document.createElement('div'))}
        canCreateSubPage
      />
    )
    expect(byRole('menuitem', /Turn into/)).toBeDefined()
    await click(getByRole('menuitem', 'Callout style'))
    expect(getByRole('menuitemradio', 'Important').getAttribute('aria-checked')).toBe('true')
    await click(getByRole('menuitemradio', 'Danger'))
    expect(calloutAt(activeEditor).attrs.tone).toBe('danger')
  })
})
