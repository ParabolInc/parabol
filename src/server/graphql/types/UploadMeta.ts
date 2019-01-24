import {GraphQLFloat, GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'

const UploadMeta = new GraphQLInputObjectType({
  name: 'UploadMeta',
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the name of the uploaded file'
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The MIME type of the file'
    },
    size: {
      type: GraphQLFloat,
      description: 'The size in bytes of the uploaded file'
    }
  })
})

export default UploadMeta
