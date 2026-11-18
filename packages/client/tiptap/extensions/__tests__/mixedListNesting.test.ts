import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import StarterKit from '@tiptap/starter-kit'

// Fails when patches/@tiptap__core@3.34.0.patch stops applying (ueberdosis/tiptap#8225)
const createEditor = (content: object) =>
  new Editor({
    extensions: [
      Document,
      StarterKit.configure({document: false}),
      TaskList,
      TaskItem.configure({nested: true})
    ],
    content
  })

type Json = {type?: string; attrs?: Record<string, unknown>; content?: Json[]}
const json = (editor: Editor) => editor.getJSON() as Json

const para = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const listItem = (text: string, ...children: object[]) => ({
  type: 'listItem',
  content: [para(text), ...children]
})
const taskItem = (text: string, checked = false, ...children: object[]) => ({
  type: 'taskItem',
  attrs: {checked},
  content: [para(text), ...children]
})

const textStart = (editor: Editor, text: string) => {
  let pos = -1
  editor.state.doc.descendants((node, p) => {
    if (pos === -1 && node.isText && node.text === text) pos = p
    return pos === -1
  })
  return pos
}

describe('mixed list nesting via @tiptap/core commands', () => {
  let editor: Editor
  afterEach(() => editor?.destroy())

  test('sinkListItem joins the previous item task sublist as a task item', () => {
    editor = createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', {type: 'taskList', content: [taskItem('existing')]}),
            listItem('Second')
          ]
        }
      ]
    })
    editor.commands.setTextSelection(textStart(editor, 'Second'))
    expect(editor.commands.sinkListItem('listItem')).toBe(true)
    const sublist = json(editor).content?.[0]?.content?.[0]?.content?.[1]
    expect(sublist?.type).toBe('taskList')
    expect(sublist?.content?.map((item) => item.type)).toEqual(['taskItem', 'taskItem'])
  })

  test('liftListItem lifts a task item into the ordered list, carrying followers as a sublist', () => {
    editor = createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', {type: 'taskList', content: [taskItem('one'), taskItem('two', true)]})
          ]
        }
      ]
    })
    editor.commands.setTextSelection(textStart(editor, 'one'))
    expect(editor.commands.liftListItem('taskItem')).toBe(true)
    const ol = json(editor).content?.[0]
    expect(ol?.content?.map((item) => item.type)).toEqual(['listItem', 'listItem'])
    const sublist = ol?.content?.[1]?.content?.[1]
    expect(sublist?.type).toBe('taskList')
    expect(sublist?.content?.[0]?.attrs?.checked).toBe(true)
  })
})
