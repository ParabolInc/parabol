import {tags} from '../../utils/constants'

export const resolveHashTag = async (query: string) => {
  return tags.filter((tag) => tag.name.startsWith(query)).map((tag) => ({id: tag.name, ...tag}))
}

export default {
  tag: resolveHashTag
}
