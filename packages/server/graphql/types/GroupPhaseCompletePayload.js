import {GraphQLNonNull, GraphQLList, GraphQLObjectType} from 'graphql'
import RetroReflectionGroup from './RetroReflectionGroup'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import {resolveNewMeeting} from '../resolvers'

const GroupPhaseCompletePayload = new GraphQLObjectType({
  name: 'GroupPhaseCompletePayload',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      description: 'the current meeting',
      resolve: resolveNewMeeting
    },
    reflectionGroups: {
      type: new GraphQLList(RetroReflectionGroup),
      description: 'a list of updated reflection groups',
      resolve: ({reflectionGroupIds}, args, {dataLoader}) => {
        return dataLoader.get('retroReflectionGroups').loadMany(reflectionGroupIds)
      }
    }
  })
})

export default GroupPhaseCompletePayload
