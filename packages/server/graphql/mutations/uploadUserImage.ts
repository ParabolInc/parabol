import {GraphQLBoolean, GraphQLInt} from 'graphql'

export default {
  type: GraphQLBoolean, // todo: return payload
  description: 'Upload an image for a user avatar',
  args: {
    dummy: {
      type: GraphQLInt,
      description: 'test test'
    }
  },
  resolve: (_, {}, {authToken}) => {
    console.log('upload mutation callled:', authToken)
  }
}
