import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import PollId from '../../../client/shared/gqlIds/PollId'
import {GQLContext} from '../graphql'
import Poll from './../types/Poll'
import makeMutationPayload from './makeMutationPayload'

export const CreatePollSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'CreatePollSuccess',
  fields: () => ({
    pollId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Poll id in a format of `poll:idGeneratedByDatabase`',
      resolve: ({pollId}) => PollId.join(pollId)
    },
    poll: {
      type: new GraphQLNonNull(Poll),
      description: 'the poll just created',
      resolve: async ({pollId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('polls').load(pollId)
      }
    }
  })
})

const CreatePollPayload = makeMutationPayload('CreatePollPayload', CreatePollSuccess)

export default CreatePollPayload
