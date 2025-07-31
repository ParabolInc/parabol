import type {JSONContent} from '@tiptap/core'
import type {TaskTag} from '../types'

const addTagToTask = (content: JSONContent, tag: TaskTag) => {
  content.content!.push({
    type: 'paragraph',
    content: [
      {
        type: 'taskTag',
        attrs: {
          id: tag,
          label: null
        }
      }
    ]
  })
  return content
}

export default addTagToTask
