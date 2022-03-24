import {GQLContext} from './../../graphql'
import {GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import generateUID from '../../../generateUID'
import getPg from '../../../postgres/getPg'
import {addUserNewFeatureQuery} from '../../../postgres/queries/generated/addUserNewFeatureQuery'
import {requireSU} from '../../../utils/authorization'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import sendToSentry from '../../../utils/sendToSentry'
import AddNewFeaturePayload from '../../types/addNewFeaturePayload'

const addNewFeature = {
  type: AddNewFeaturePayload,
  description: 'broadcast a new feature to the entire userbase',
  args: {
    actionButtonCopy: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text of the action button in the snackbar'
    },
    snackbarMessage: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of the new feature'
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The permalink to the blog post describing the new feature'
    }
  },
  resolve: async (
    _source: unknown,
    {
      actionButtonCopy,
      snackbarMessage,
      url
    }: {actionButtonCopy: string; snackbarMessage: string; url: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    const r = await getRethink()
    const redis = getRedis()

    // AUTH
    requireSU(authToken)
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
  }
}

export default addNewFeature
