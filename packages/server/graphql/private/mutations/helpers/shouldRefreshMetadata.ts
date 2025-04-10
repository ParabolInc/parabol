import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'
import ms from 'ms'
import * as samlify from 'samlify'

dayjs.extend(durationPlugin)

export const shouldRefreshMetadata = (doc: {metadata: string | null; updatedAt: Date}) => {
  const {metadata, updatedAt} = doc
  if (!metadata) {
    return true
  }

  const {validUntil, cacheDuration} = samlify.Extractor.extract(metadata, [
    {
      key: 'validUntil',
      localPath: ['EntityDescriptor'],
      attributes: ['validUntil']
    },
    {
      key: 'cacheDuration',
      localPath: ['EntityDescriptor'],
      attributes: ['cacheDuration']
    }
  ])

  if (validUntil) {
    const nearFuture = dayjs().add(dayjs.duration(ms('30d')))
    const validUntilDate = dayjs(validUntil)
    if (validUntilDate < nearFuture) {
      return true
    }
  }
  if (cacheDuration) {
    const cacheExpiry = dayjs(updatedAt).add(dayjs.duration(cacheDuration))

    if (cacheExpiry.isBefore(dayjs())) {
      return true
    }
  }
  return false
}
