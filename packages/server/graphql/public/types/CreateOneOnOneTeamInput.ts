import {GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'
import GraphQLEmailType from '../../types/GraphQLEmailType'

const CreateOneOnOneTeamInput = new GraphQLInputObjectType({
  name: 'CreateOneOnOneTeamInput',
  fields: () => ({
    email: {
      type: new GraphQLNonNull(GraphQLEmailType)
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
