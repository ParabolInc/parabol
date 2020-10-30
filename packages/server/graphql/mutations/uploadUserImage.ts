import {GraphQLBoolean, GraphQLInt} from 'graphql'
import GraphQLFileStreamType from '../types/GraphQLFileStreamType'

export default {
  type: GraphQLBoolean, // todo: return payload
  description: 'Upload an image for a user avatar',
  args: {
    dummy: {
      type: GraphQLInt,
      description: 'test test'
    },
    file: {
      type: GraphQLFileStreamType,
      description: 'the file'
    },
    test: {
      type: GraphQLInt,
      description: 'testtest '
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
