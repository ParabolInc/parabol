import {GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'

const CreateOneOnOneTeamInput = new GraphQLInputObjectType({
  name: 'CreateOneOnOneTeamInput',
  fields: () => ({
    userId: {
      type: GraphQLString
    },
    email: {
      type: GraphQLString
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export type CreateOneOnOneTeamInputType = {
  userId: string | null
  email: string | null
  orgId: string
}

export default CreateOneOnOneTeamInput
