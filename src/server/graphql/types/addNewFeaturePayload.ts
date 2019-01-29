import {GraphQLObjectType} from 'graphql'
import NewFeatureBroadcast from './NewFeatureBroadcast'

const AddNewFeaturePayload = new GraphQLObjectType({
  name: 'AddNewFeaturePayload',
  fields: () => ({
    newFeature: {
      type: NewFeatureBroadcast,
      description: 'the new feature broadcast'
    }
  })
})

export default AddNewFeaturePayload
