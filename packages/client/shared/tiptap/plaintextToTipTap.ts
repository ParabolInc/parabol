import type {TaskTag} from '../types'

export const plaintextToTipTap = (str: string, options: {taskTags?: TaskTag[]} = {}) => {
  const content = str ? [{type: 'text', text: str}] : []
  const taskTags = options.taskTags ?? []
  return {
    type: 'doc',
    content: [
      {type: 'paragraph', content},
      ...taskTags.map((taskTag) => ({
        type: 'paragraph',
        content: [{type: 'taskTag', attrs: {id: taskTag, label: null, mentionSuggestionChar: '@'}}]
      }))
    ]
  }
}
