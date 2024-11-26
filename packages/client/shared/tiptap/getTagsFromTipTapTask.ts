import {JSONContent} from '@tiptap/core'
import {TaskTag} from '../../../server/postgres/types'
import {getAllNodesAttributesByType} from './getAllNodesAttributesByType'

export const getTagsFromTipTapTask = (content: JSONContent) => {
  const tagAttributes = getAllNodesAttributesByType<{id: TaskTag}>(content, 'taskTag')
  return [...new Set(tagAttributes.map(({id}) => id))]
}
