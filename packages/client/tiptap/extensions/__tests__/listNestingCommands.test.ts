import {getSchema} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import type {Node as PMNode} from '@tiptap/pm/model'
import {EditorState} from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import {indentItem, outdentItem} from '../listNestingCommands'

const schema = getSchema([
  Document,
  StarterKit.configure({document: false}),
  TaskList,
  TaskItem.configure({nested: true})
])

const para = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const stateFrom = (docJSON: unknown) =>
  EditorState.create({schema, doc: schema.nodeFromJSON(docJSON as never)})

const ITEM = new Set(['listItem', 'taskItem'])
const itemPosByText = (doc: PMNode, text: string): number => {
  let pos = -1
  doc.descendants((node, p) => {
    if (ITEM.has(node.type.name) && node.textContent.startsWith(text)) pos = p
    return true
  })
  return pos
}

describe('outdentItem (adopt ancestor list type)', () => {
  test('nested taskItem becomes an ordered sibling, adopting ordered type', () => {
    const state = stateFrom({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                para('First'),
                {
                  type: 'taskList',
                  content: [
                    {type: 'taskItem', attrs: {checked: false}, content: [para('This is one')]}
                  ]
                }
              ]
            },
            {type: 'listItem', content: [para('Second')]},
            {type: 'listItem', content: [para('Third')]}
          ]
        }
      ]
    })
    const tr = outdentItem(state, itemPosByText(state.doc, 'This is one'))
    expect(tr).not.toBeNull()
    const result = state.apply(tr!)
    expect(() => result.doc.check()).not.toThrow()
    const ol = result.doc.child(0)
    expect(ol.childCount).toBe(4)
    expect(ol.child(1).type.name).toBe('listItem')
    expect(ol.child(1).textContent).toBe('This is one')
    expect(ol.child(2).textContent).toBe('Second')
  })

  test('leaves siblings behind when the item is not the only one in its list', () => {
    const state = stateFrom({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                para('First'),
                {
                  type: 'taskList',
                  content: [
                    {type: 'taskItem', attrs: {checked: false}, content: [para('one')]},
                    {type: 'taskItem', attrs: {checked: false}, content: [para('two')]}
                  ]
                }
              ]
            }
          ]
        }
      ]
    })
    const tr = outdentItem(state, itemPosByText(state.doc, 'one'))
    expect(tr).not.toBeNull()
    const result = state.apply(tr!)
    expect(() => result.doc.check()).not.toThrow()
    const ol = result.doc.child(0)
    expect(ol.childCount).toBe(2)
    expect(ol.child(1).textContent).toBe('one')
    // 'two' remains nested under First
    expect(ol.child(0).child(1).type.name).toBe('taskList')
    expect(ol.child(0).child(1).textContent).toBe('two')
  })

  test('returns null for a top-level list (not nested)', () => {
    const state = stateFrom({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [{type: 'taskItem', attrs: {checked: false}, content: [para('x')]}]
        }
      ]
    })
    expect(outdentItem(state, itemPosByText(state.doc, 'x'))).toBeNull()
  })
})

describe('indentItem (adopt previous sublist type)', () => {
  test('item joins the previous item trailing sublist, adopting its type', () => {
    const state = stateFrom({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                para('First'),
                {
                  type: 'taskList',
                  content: [
                    {type: 'taskItem', attrs: {checked: false}, content: [para('existing')]}
                  ]
                }
              ]
            },
            {type: 'listItem', content: [para('Second')]}
          ]
        }
      ]
    })
    const tr = indentItem(state, itemPosByText(state.doc, 'Second'))
    expect(tr).not.toBeNull()
    const result = state.apply(tr!)
    expect(() => result.doc.check()).not.toThrow()
    const ol = result.doc.child(0)
    expect(ol.childCount).toBe(1)
    const sublist = ol.child(0).child(1)
    expect(sublist.type.name).toBe('taskList')
    expect(sublist.childCount).toBe(2)
    expect(sublist.child(1).textContent).toBe('Second')
  })

  test('returns null when previous item has no trailing sublist (stock sink applies)', () => {
    const state = stateFrom({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {type: 'listItem', content: [para('First')]},
            {type: 'listItem', content: [para('Second')]}
          ]
        }
      ]
    })
    expect(indentItem(state, itemPosByText(state.doc, 'Second'))).toBeNull()
  })

  test('returns null for the first item (nothing to indent under)', () => {
    const state = stateFrom({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [{type: 'listItem', content: [para('First')]}]
        }
      ]
    })
    expect(indentItem(state, itemPosByText(state.doc, 'First'))).toBeNull()
  })
})
