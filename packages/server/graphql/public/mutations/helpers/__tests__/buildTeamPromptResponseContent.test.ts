import type {JSONContent} from '@tiptap/core'
import {isEmptyAnswerDoc} from '../../../../../../client/shared/tiptap/isEmptyAnswerDoc'
import buildTeamPromptResponseContent from '../buildTeamPromptResponseContent'

const doc = (content: JSONContent[]): JSONContent => ({type: 'doc', content})

const emptyTable = (): JSONContent => ({
  type: 'table',
  content: [
    {
      type: 'tableRow',
      content: [
        {type: 'tableHeader', content: [{type: 'paragraph'}]},
        {type: 'tableHeader', content: [{type: 'paragraph'}]}
      ]
    },
    {
      type: 'tableRow',
      content: [
        {type: 'tableCell', content: [{type: 'paragraph'}]},
        {type: 'tableCell', content: [{type: 'paragraph'}]}
      ]
    }
  ]
})

const tableWithOneAnsweredCell = (): JSONContent => ({
  type: 'table',
  content: [
    {
      type: 'tableRow',
      content: [
        {type: 'tableHeader', content: [{type: 'paragraph'}]},
        {type: 'tableHeader', content: [{type: 'paragraph'}]}
      ]
    },
    {
      type: 'tableRow',
      content: [
        {
          type: 'tableCell',
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Done'}]}]
        },
        {type: 'tableCell', content: [{type: 'paragraph'}]}
      ]
    }
  ]
})

const details = (summaryText: string, bodyText?: string): JSONContent => ({
  type: 'details',
  attrs: {open: false},
  content: [
    {type: 'detailsSummary', content: summaryText ? [{type: 'text', text: summaryText}] : []},
    {
      type: 'detailsContent',
      content: [
        bodyText
          ? {type: 'paragraph', content: [{type: 'text', text: bodyText}]}
          : {type: 'paragraph'}
      ]
    }
  ]
})

const emptyCodeBlock = (): JSONContent => ({type: 'codeBlock', content: []})

const taskList = (): JSONContent => ({
  type: 'taskList',
  content: [
    {type: 'taskItem', attrs: {checked: true}, content: [{type: 'paragraph'}]},
    {
      type: 'taskItem',
      attrs: {checked: false},
      content: [{type: 'paragraph', content: [{type: 'text', text: 'Buy milk'}]}]
    }
  ]
})

describe('isEmptyAnswerDoc', () => {
  test.each([
    ['an empty 2x2 table', doc([emptyTable()])],
    ['an empty details node (blank summary and body)', doc([details('')])],
    ['an empty code block', doc([emptyCodeBlock()])],
    ['a doc whose only node is an abandoned upload placeholder', doc([{type: 'fileUpload'}])]
  ])('%s is empty', (_name, content) => {
    expect(isEmptyAnswerDoc(content)).toBe(true)
  })

  test.each([
    ['a table with one non-blank cell', doc([tableWithOneAnsweredCell()])],
    ['a details node with text in the summary only', doc([details('Sum')])],
    ['a doc whose only node is a horizontal rule', doc([{type: 'horizontalRule'}])],
    ['a task list with one checked empty item and one item with text', doc([taskList()])]
  ])('%s is not empty', (_name, content) => {
    expect(isEmptyAnswerDoc(content)).toBe(false)
  })
})

describe('buildTeamPromptResponseContent', () => {
  test('keeps table and details nodes verbatim in the derived content', () => {
    const prompts = [
      {id: 'prompt1', question: 'What did you ship?'},
      {id: 'prompt2', question: 'What are you stuck on?'}
    ]
    const table = tableWithOneAnsweredCell()
    const detailsNode = details('Sum', 'Body')
    const answers = [
      {
        promptId: 'prompt1',
        content: doc([table]),
        plaintextContent: 'Done'
      },
      {
        promptId: 'prompt2',
        content: doc([detailsNode]),
        plaintextContent: 'Sum\nBody'
      }
    ]

    const {content} = buildTeamPromptResponseContent(prompts, answers)

    expect(content.content).toEqual([
      {type: 'heading', attrs: {level: 3}, content: [{type: 'text', text: 'What did you ship?'}]},
      table,
      {
        type: 'heading',
        attrs: {level: 3},
        content: [{type: 'text', text: 'What are you stuck on?'}]
      },
      detailsNode
    ])
  })
})
