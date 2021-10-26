import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import Poll from './../types/Poll'
import PollId from '../../../client/shared/gqlIds/PollId'

export const CreatePollSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'CreatePollSuccess',
  fields: () => ({
    pollId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'Poll id in a format of `poll:idGeneratedByDatabase`',
      resolve: ({pollId}) => PollId.join(pollId)
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
