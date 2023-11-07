import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const TranscriptBlock = new GraphQLObjectType<any, GQLContext>({
  name: 'TranscriptBlock',
  description: 'A block of the meeting transcription with a speaker and text',
  fields: () => ({
    speaker: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The speaker who said the words'
    },
    words: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The words that the speaker said'
    }
  })
})

export default TranscriptBlock
