import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'

const NewTeamInput = new GraphQLInputObjectType({
  name: 'NewTeamInput',
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the organization this team belongs to'
    },
    isPublic: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the team is public (can be found and joined) or private (invite-only)'
    }
  })
})

export type NewTeamInputType = {
  name: string
  orgId: string
  isPublic: boolean
}

export default NewTeamInput
