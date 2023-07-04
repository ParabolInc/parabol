import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import GraphQLEmailType from './GraphQLEmailType'

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
    },
    invitees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLEmailType))),
      description: 'The emails of the users to invite to the team'
    }
  })
})

export type NewTeamInputType = {
  name: string
  orgId?: string
}

export default NewTeamInput
