import {tags} from '../../utils/constants'

export const resolveHashTag = async (query) => {
  return tags.filter((tag) => tag.name.startsWith(query))
}

export default {
  tag: resolveHashTag
}
