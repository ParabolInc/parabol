import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting} from '../resolvers'
import RetroReflectionGroup from './RetroReflectionGroup'
import RetrospectiveMeeting from './RetrospectiveMeeting'

const GroupPhaseCompletePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'GroupPhaseCompletePayload',
  fields: () => ({
    emptyReflectionGroupIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'a list of empty reflection groups to remove'
    },
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      description: 'the current meeting',
      resolve: resolveNewMeeting
    },
    reflectionGroups: {
      type: new GraphQLList(RetroReflectionGroup),
      description: 'a list of updated reflection groups',
      resolve: ({reflectionGroupIds}, _args: unknown, {dataLoader}) => {
        return reflectionGroupIds
          ? dataLoader.get('retroReflectionGroups').loadMany(reflectionGroupIds)
          : []
      }
    }
  })
})

export default GroupPhaseCompletePayload
