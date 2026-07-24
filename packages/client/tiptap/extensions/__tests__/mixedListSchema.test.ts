import {getSchema} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import StarterKit from '@tiptap/starter-kit'

// Mirror the Pages editor's list configuration (see useTipTapPageEditor.ts /
// serverTipTapExtensions.ts): StarterKit supplies bulletList/orderedList/
// listItem; TaskList + nested TaskItem supply the checkbox list.
const schema = getSchema([
  Document,
  StarterKit.configure({document: false}),
  TaskList,
  TaskItem.configure({nested: true})
])

const taskItem = (text: string) => ({
  type: 'taskItem',
  attrs: {checked: false},
  content: [{type: 'paragraph', content: [{type: 'text', text}]}]
})

const listItem = (...content: unknown[]) => ({type: 'listItem', content})

const para = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})

describe('Pages list schema permits mixed nesting', () => {
  test('taskList nests inside an orderedList listItem', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [listItem(para('A'), {type: 'taskList', content: [taskItem('B')]})]
        }
      ]
    }
    expect(() => schema.nodeFromJSON(doc).check()).not.toThrow()
  })

  test('orderedList nests inside a taskItem', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: {checked: false},
              content: [para('A'), {type: 'orderedList', content: [listItem(para('B'))]}]
            }
          ]
        }
      ]
    }
    expect(() => schema.nodeFromJSON(doc).check()).not.toThrow()
  })

  test('bulletList nests inside a taskItem', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: {checked: false},
              content: [para('A'), {type: 'bulletList', content: [listItem(para('B'))]}]
            }
          ]
        }
      ]
    }
    expect(() => schema.nodeFromJSON(doc).check()).not.toThrow()
  })

  test('control: check() rejects a listItem containing bare text', () => {
    const invalid = {
      type: 'doc',
      content: [
        {type: 'orderedList', content: [{type: 'listItem', content: [{type: 'text', text: 'x'}]}]}
      ]
    }
    expect(() => schema.nodeFromJSON(invalid).check()).toThrow()
  })
})
