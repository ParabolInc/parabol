import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'

const NewTeamInput = new GraphQLInputObjectType({
  name: 'NewTeamInput',
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team'
    },
    orgId: {
      type: GraphQLID,
      description: 'The unique orginization ID that pays for the team'
    }
  })
})

export type NewTeamInputType = {
  name: string
  orgId?: string
}

export default NewTeamInput
