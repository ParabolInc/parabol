import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import Team from './Team'

const CreateMassInvitationSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'CreateMassInvitationSuccess',
  fields: () => ({
    team: {
      type: new GraphQLNonNull(Team),
      description: 'the team with the updated mass inivtation',
      resolve: async ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

const CreateMassInvitationPayload = makeMutationPayload(
  'CreateMassInvitationPayload',
  CreateMassInvitationSuccess
)

export default CreateMassInvitationPayload
