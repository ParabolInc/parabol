import type {TaskTag} from '../types'

export const plaintextToTipTap = (str: string, options: {taskTags?: TaskTag[]} = {}) => {
  const textNode = {type: 'text', text: str}
  const content: any[] = str ? [textNode] : []
  const taskTags = options.taskTags ?? []
  taskTags.forEach((taskTag) => {
    content.push({
      type: 'paragraph',
      content: [
        {
          type: 'taskTag',
          attrs: {id: taskTag, label: null, mentionSuggestionChar: '@'}
        }
      ]
    })
  })
  return {type: 'doc', content: [{type: 'paragraph', content}]}
}
