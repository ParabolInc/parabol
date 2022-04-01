import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import generateUID from '../../../generateUID'
import getPg from '../../../postgres/getPg'
import {addUserNewFeatureQuery} from '../../../postgres/queries/generated/addUserNewFeatureQuery'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import sendToSentry from '../../../utils/sendToSentry'
import {MutationResolvers} from '../resolverTypes'

const addNewFeature: MutationResolvers['addNewFeature'] = async (
  _source,
  {actionButtonCopy, snackbarMessage, url},
  {dataLoader}
) => {
  const r = await getRethink()
  const redis = getRedis()

  // AUTH
  const operationId = dataLoader.share()
  const subOptions = {operationId}

  // RESOLUTION
  const newFeatureId = generateUID()
  const newFeature = {
    id: newFeatureId,
    actionButtonCopy,
    snackbarMessage,
    url
  }
  await Promise.all([
    r.table('NewFeature').insert(newFeature).run(),
    addUserNewFeatureQuery.run({newFeatureId}, getPg())
  ])

  const onlineUserIds = new Set()
  const stream = redis.scanStream({match: 'presence:*'})
  stream.on('data', (keys) => {
    if (!keys?.length) return
    for (const key of keys) {
      const userId = key.substring('presence:'.length)
      if (!onlineUserIds.has(userId)) {
        onlineUserIds.add(userId)
        publish(
          SubscriptionChannel.NOTIFICATION,
          userId,
          'AddNewFeaturePayload',
          {newFeature},
          subOptions
        )
      }
    }
  })
  await new Promise((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', (e) => {
      sendToSentry(e)
      reject(e)
    })
  })
  return {newFeature}
}

export default addNewFeature
