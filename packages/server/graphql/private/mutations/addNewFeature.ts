import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import sendToSentry from '../../../utils/sendToSentry'
import {MutationResolvers} from '../resolverTypes'

const addNewFeature: MutationResolvers['addNewFeature'] = async (
  _source,
  {actionButtonCopy, snackbarMessage, url},
  {dataLoader}
) => {
  const redis = getRedis()
  const pg = getKysely()

  // AUTH
  const operationId = dataLoader.share()
  const subOptions = {operationId}

  // RESOLUTION
  const newFeatureRes = await pg
    .with('NewFeatureInsert', (qb) =>
      qb.insertInto('NewFeature').values({actionButtonCopy, snackbarMessage, url}).returning('id')
    )
    .updateTable('User')
    .set((eb) => ({newFeatureId: eb.selectFrom('NewFeatureInsert').select('NewFeatureInsert.id')}))
    .returning((eb) => [eb.selectFrom('NewFeatureInsert').select('NewFeatureInsert.id').as('id')])
    .executeTakeFirstOrThrow()

  const newFeature = {actionButtonCopy, snackbarMessage, url, id: newFeatureRes.id!}
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
