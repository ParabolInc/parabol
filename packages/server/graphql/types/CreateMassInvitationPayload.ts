import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import Team from './Team'
import makeMutationPayload from './makeMutationPayload'

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
