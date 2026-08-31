import {resolveEmbed} from '../../../utils/embed/resolveEmbed'
import type {QueryResolvers} from '../resolverTypes'

const resolveEmbedUrl: QueryResolvers['resolveEmbedUrl'] = async (_source, {url, refresh}) => {
  const result = await resolveEmbed(url, refresh ?? false)
  if (!result) return null
  const {metadata} = result
  return {
    ...metadata,
    fetchedAt: metadata.fetchedAt ? new Date(metadata.fetchedAt) : null
  }
}

export default resolveEmbedUrl
