import {getSchema} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import {Fragment, type Node, Slice} from '@tiptap/pm/model'
import StarterKit from '@tiptap/starter-kit'
import {getListItemDropPos} from '../listItemDropPoint'

const schema = getSchema([
  Document,
  StarterKit.configure({document: false}),
  TaskList,
  TaskItem.configure({nested: true})
])

const para = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const taskItem = (text: string) => ({
  type: 'taskItem',
  attrs: {checked: false},
  content: [para(text)]
})
const docOf = (...content: object[]) => schema.nodeFromJSON({type: 'doc', content})
const sliceOf = (...nodes: object[]) =>
  new Slice(Fragment.fromArray(nodes.map((node) => schema.nodeFromJSON(node))), 0, 0)

const textPos = (doc: Node, text: string) => {
  let found = -1
  doc.descendants((node, pos) => {
    if (found === -1 && node.isText && node.text === text) found = pos
    return found === -1
  })
  return found
}

const numberedThenTodos = docOf(
  {
    type: 'orderedList',
    content: [
      {type: 'listItem', content: [para('Draft the announcement')]},
      {type: 'listItem', content: [para('Ship the release')]}
    ]
  },
  {type: 'taskList', content: [taskItem('Record the demo')]}
)

describe('getListItemDropPos', () => {
  test('a to-do dropped over the start of a numbered line goes just after that line', () => {
    const doc = numberedThenTodos
    const start = textPos(doc, 'Ship the release')
    const pos = getListItemDropPos(doc, start + 1, sliceOf(taskItem('Record the demo')))
    expect(pos).toBe(start + 'Ship the release'.length + 1)
    expect(doc.resolve(pos!).parent.type.name).toBe('listItem')
  })

  test('the result accepts the to-do, wrapped in a to-do list inside the item', () => {
    const doc = numberedThenTodos
    const pos = getListItemDropPos(
      doc,
      textPos(doc, 'Draft the announcement') + 2,
      sliceOf(taskItem('Record the demo'))
    )!
    const $pos = doc.resolve(pos)
    expect($pos.parent.type.name).toBe('listItem')
    expect($pos.parent.canReplaceWith($pos.index(), $pos.index(), schema.nodes.taskList!)).toBe(
      true
    )
  })

  test('keeps the stock spot when the drop already lands inside the list', () => {
    const doc = numberedThenTodos
    const end = textPos(doc, 'Ship the release') + 'Ship the release'.length
    expect(getListItemDropPos(doc, end, sliceOf(taskItem('Record the demo')))).toBeNull()
  })

  test('keeps the stock spot for reordering items of the same type', () => {
    const doc = docOf({type: 'taskList', content: [taskItem('one'), taskItem('two')]})
    expect(getListItemDropPos(doc, textPos(doc, 'two') + 1, sliceOf(taskItem('three')))).toBeNull()
  })

  test('ignores drags that are not list items', () => {
    const doc = numberedThenTodos
    const start = textPos(doc, 'Ship the release')
    expect(getListItemDropPos(doc, start + 1, sliceOf(para('loose')))).toBeNull()
  })

  test('ignores drops over a line that is not a list item', () => {
    const doc = docOf(para('Intro'), {type: 'taskList', content: [taskItem('one')]})
    expect(getListItemDropPos(doc, textPos(doc, 'Intro') + 1, sliceOf(taskItem('x')))).toBeNull()
  })
})
