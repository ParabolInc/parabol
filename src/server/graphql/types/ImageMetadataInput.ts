import {GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql'

const ImageMetadataInput = new GraphQLInputObjectType({
  name: 'ImageMetadataInput',
  fields: () => ({
    contentType: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'user-supplied MIME content type'
    },
    contentLength: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'user-supplied file size'
    }
  })
})

export default ImageMetadataInput
