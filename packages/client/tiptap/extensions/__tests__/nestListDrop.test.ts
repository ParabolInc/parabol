import {getSchema} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import type {Node as PMNode} from '@tiptap/pm/model'
import {EditorState} from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import {isListNode, moveListIntoItem} from '../nestListDrop'

const schema = getSchema([
  Document,
  StarterKit.configure({document: false}),
  TaskList,
  TaskItem.configure({nested: true})
])

const para = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const stateFrom = (docJSON: unknown) =>
  EditorState.create({schema, doc: schema.nodeFromJSON(docJSON as never)})

const posOfType = (doc: PMNode, typeName: string): number => {
  let found = -1
  doc.descendants((node, pos) => {
    if (found === -1 && node.type.name === typeName) found = pos
    return found === -1
  })
  return found
}

describe('isListNode', () => {
  test('recognizes the three list wrappers', () => {
    const {nodes} = schema
    expect(isListNode(nodes.taskList!.create())).toBe(true)
    expect(isListNode(nodes.bulletList!.create())).toBe(true)
    expect(isListNode(nodes.orderedList!.create())).toBe(true)
    expect(isListNode(nodes.paragraph!.create())).toBe(false)
  })
})

describe('moveListIntoItem', () => {
  test('nests a taskList (below) into the listItem above it, keeping type', () => {
    const state = stateFrom({
      type: 'doc',
      content: [
        {type: 'orderedList', content: [{type: 'listItem', content: [para('A')]}]},
        {
          type: 'taskList',
          content: [{type: 'taskItem', attrs: {checked: false}, content: [para('B')]}]
        }
      ]
    })
    const tr = moveListIntoItem(
      state,
      posOfType(state.doc, 'taskList'),
      posOfType(state.doc, 'listItem')
    )
    const result = state.apply(tr)
    expect(() => result.doc.check()).not.toThrow()
    expect(result.doc.childCount).toBe(1)
    const li = result.doc.child(0).child(0)
    expect(li.childCount).toBe(2)
    expect(li.child(1).type.name).toBe('taskList')
    expect(li.child(1).child(0).type.name).toBe('taskItem')
  })

  test('nests an orderedList (above) into a taskItem below it', () => {
    const state = stateFrom({
      type: 'doc',
      content: [
        {type: 'orderedList', content: [{type: 'listItem', content: [para('B')]}]},
        {
          type: 'taskList',
          content: [{type: 'taskItem', attrs: {checked: false}, content: [para('A')]}]
        }
      ]
    })
    const tr = moveListIntoItem(
      state,
      posOfType(state.doc, 'orderedList'),
      posOfType(state.doc, 'taskItem')
    )
    const result = state.apply(tr)
    expect(() => result.doc.check()).not.toThrow()
    expect(result.doc.childCount).toBe(1)
    const ti = result.doc.child(0).child(0)
    expect(ti.childCount).toBe(2)
    expect(ti.child(1).type.name).toBe('orderedList')
  })
})
