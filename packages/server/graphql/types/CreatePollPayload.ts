import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import Poll from './../types/Poll'

export const CreatePollSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'CreatePollSuccess',
  fields: () => ({
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting where the poll was added'
    },
    poll: {
      type: GraphQLNonNull(Poll),
      description: 'the poll just created',
      resolve: async ({pollId}, _args, {dataLoader}) => {
        return dataLoader.get('polls').load(pollId)
      }
    }
  })
})

const CreatePollPayload = makeMutationPayload('CreatePollPayload', CreatePollSuccess)

export default CreatePollPayload
