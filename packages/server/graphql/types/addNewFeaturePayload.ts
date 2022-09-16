import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import NewFeatureBroadcast from './NewFeatureBroadcast'

const AddNewFeaturePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddNewFeaturePayload',
  fields: () => ({
    newFeature: {
      type: NewFeatureBroadcast,
      description: 'the new feature broadcast'
    }
  })
})

export default AddNewFeaturePayload
