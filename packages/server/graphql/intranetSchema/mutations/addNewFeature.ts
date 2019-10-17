import {GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {requireSU} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import shortid from 'shortid'
import {NOTIFICATION} from '../../../../client/utils/constants'
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
    await r({
      newFeature: r.table('NewFeature').insert(newFeature),
      userUpdate: r.table('User').update({
        newFeatureId
      })
    }).run()

    const onlineUserIds = await r
      .table('User')
      .filter((user) =>
        user('connectedSockets')
          .count()
          .ge(1)
      )('id')
      .run()
    onlineUserIds.forEach((userId) => {
      publish(NOTIFICATION, userId, AddNewFeaturePayload, {newFeature}, subOptions)
    })
    return {newFeature}
  }
}

export default addNewFeature
