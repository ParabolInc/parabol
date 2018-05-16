import {GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql'

const NewTeamInput = new GraphQLInputObjectType({
  name: 'NewTeamInput',
  fields: () => ({
    name: {type: GraphQLString, description: 'The name of the team'},
    orgId: {
      type: GraphQLID,
      description: 'The unique orginization ID that pays for the team'
    }
  })
})

export default NewTeamInput
