import {GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'

const CreateOneOnOneTeamInput = new GraphQLInputObjectType({
  name: 'CreateOneOnOneTeamInput',
  fields: () => ({
    email: {
      type: new GraphQLNonNull(GraphQLString)
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export type CreateOneOnOneTeamInputType = {
  email: string
  orgId: string
}

export default CreateOneOnOneTeamInput
