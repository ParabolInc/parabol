import {GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'

const OneOnOneTeamInput = new GraphQLInputObjectType({
  name: 'OneOnOneTeamInput',
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

export default OneOnOneTeamInput
