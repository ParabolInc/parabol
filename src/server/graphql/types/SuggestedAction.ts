import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import SuggestedActionTypeEnum from 'server/graphql/types/SuggestedActionTypeEnum'
import User from 'server/graphql/types/User'

export const suggestedActionInterfaceFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: '* The timestamp the action was created at'
  },
  removedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: '* The timestamp the action was removed at'
  },
  suggestedActionType: {
    type: new GraphQLNonNull(SuggestedActionTypeEnum),
    description: 'The specific type of suggested action'
  },
  userId: {
    type: new GraphQLNonNull(GraphQLID),
    description: '* The userId this action is for'
  },
  user: {
    type: new GraphQLNonNull(User),
    description: 'The user than can see this event',
    resolve: ({userId}, _args, {dataLoader}) => {
      return dataLoader.get('users').load(userId)
    }
  }
})

const SuggestedAction = new GraphQLObjectType({
  name: 'SuggestedAction',
  description: 'A past event that is important to the viewer',
  fields: suggestedActionInterfaceFields,
  resovleType: (value) => {
    const resolveTypeLookup = {}
    return resolveTypeLookup[value.type]
  }
})

export default SuggestedAction
