import {getTagsFromTipTapTask} from '../getTagsFromTipTapTask'
import {plaintextToTipTap} from '../plaintextToTipTap'

test('wraps the text in one paragraph', () => {
  expect(plaintextToTipTap('Fix it')).toEqual({
    type: 'doc',
    content: [{type: 'paragraph', content: [{type: 'text', text: 'Fix it'}]}]
  })
})

test('gives empty text an empty paragraph', () => {
  expect(plaintextToTipTap('')).toEqual({type: 'doc', content: [{type: 'paragraph', content: []}]})
})

test('puts each task tag in a paragraph of its own after the text', () => {
  const doc = plaintextToTipTap('Fix it', {taskTags: ['archived']})
  expect(doc.content).toEqual([
    {type: 'paragraph', content: [{type: 'text', text: 'Fix it'}]},
    {
      type: 'paragraph',
      content: [{type: 'taskTag', attrs: {id: 'archived', label: null, mentionSuggestionChar: '@'}}]
    }
  ])
  expect(getTagsFromTipTapTask(doc)).toEqual(['archived'])
})
