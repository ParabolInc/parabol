import {GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import shortid from 'shortid'
import getRethink from '../../../database/rethinkDriver'
import db from '../../../db'
import {requireSU} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import AddNewFeaturePayload from '../../types/addNewFeaturePayload'

const addNewFeature = {
  type: AddNewFeaturePayload,
  description: 'broadcast a new feature to the entire userbase',
  args: {
    copy: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text body of the new feature'
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the permalink to the blog post'
    }
  },
  resolve: async (_source, {copy, url}, {authToken, dataLoader}) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)
    const operationId = dataLoader.share()
    const subOptions = {operationId}

    // RESOLUTION
    const newFeatureId = shortid.generate()
    const newFeature = {
      id: newFeatureId,
      copy,
      url
    }
    await Promise.all([
      r
        .table('NewFeature')
        .insert(newFeature)
        .run(),
      db.writeTable('User', {newFeatureId})
    ])

    const onlineUserIds = await r
      .table('User')
      .filter((user) =>
        user('connectedSockets')
          .count()
          .ge(1)
      )('id')
      .run()
    onlineUserIds.forEach((userId) => {
      publish(
        SubscriptionChannel.NOTIFICATION,
        userId,
        'AddNewFeaturePayload',
        {newFeature},
        subOptions
      )
    })
    return {newFeature}
  }
}

export default addNewFeature
