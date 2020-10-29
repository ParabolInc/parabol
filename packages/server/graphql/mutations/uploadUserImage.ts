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
  resolve: (source, variables, context) => {
    console.log('upload mutation callled!')
    console.log('source:', source)
    console.log('variables:', variables)
    console.log('context:', context)
    // todo: get file from context here
  }
}
