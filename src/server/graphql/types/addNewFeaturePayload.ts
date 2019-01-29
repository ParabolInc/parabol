import {GraphQLObjectType} from 'graphql'
import User from './User'

const AddNewFeaturePayload = new GraphQLObjectType({
  name: 'AddNewFeaturePayload',
  fields: () => ({
    user: {
      type: User,
      description:
        'a piece of the user doc including on the new feature broadcast. null if returned by the mutator'
    }
  })
})

export default AddNewFeaturePayload
