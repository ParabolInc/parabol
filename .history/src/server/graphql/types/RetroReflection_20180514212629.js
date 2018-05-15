import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem'
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup'
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting'
import {getUserId} from 'server/utils/authorization'
import {makeResolve, resolveForSU} from 'server/graphql/resolvers'
import GoogleAnalyzedEntity from 'server/graphql/types/GoogleAnalyzedEntity'
import User from 'server/graphql/types/User'

const RetroReflection = new GraphQLObjectType({
  name: 'RetroReflection',
  description: 'A reflection created during the reflect phase of a retrospective',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    autoReflectionGroupId: {
      type: GraphQLID,
      description:
        'The ID of the group that the autogrouper assigned the reflection. Error rate = Sum(autoId != Id) / autoId.count()',
      resolve: resolveForSU('autoGroupThreshold')
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was created'
    },
    creatorId: {
      description: 'The userId that created the reflection (or unique Id if not a team member)',
      type: GraphQLID,
      resolve: resolveForSU('creatorId')
    },
    draggerUserId: {
      description: 'The userId of the person currently dragging the reflection',
      type: GraphQLID
    },
    draggerUser: {
      description: 'The user that is currently dragging the reflection',
      type: User,
      resolve: makeResolve('draggerUserId', 'draggerUser', 'users')
    },
    draggerCoords: {
      description: 'The coordinates necessary to simulate a drag for a subscribing user',
      type: require('./Coords2D')
    },
    editorIds: {
      description: 'an array of all the socketIds that are currently editing the reflection',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      resolve: () => []
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'True if the reflection was not removed, else false'
    },
    isEditing: {
      description: 'true if the reflection is being edited, else false',
      type: GraphQLBoolean
    },
    isViewerCreator: {
      description: 'true if the viewer (userId) is the creator of the retro reflection, else false',
      type: GraphQLBoolean,
      resolve: ({creatorId}, args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === creatorId
      }
    },
    content: {
      description: 'The stringified draft-js content',
      type: new GraphQLNonNull(GraphQLString)
    },
    entities: {
      description:
        'The entities (i.e. nouns) parsed from the content and their respective salience',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GoogleAnalyzedEntity))),
      resolve: resolveForSU('entities')
    },
    meetingId: {
      type: GraphQLID,
      description: 'The foreign key to link a reflection to its meeting'
    },
    meeting: {
      type: RetrospectiveMeeting,
      description: 'The retrospective meeting this reflection was created in',
      resolve: ({meetingId}, args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    phaseItem: {
      type: new GraphQLNonNull(RetroPhaseItem),
      resolve: ({retroPhaseItemId}, args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(retroPhaseItemId)
      }
    },
    retroPhaseItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The foreign key to link a reflection to its phaseItem. Immutable. For sorting, use phase item on the group.'
    },
    reflectionGroupId: {
      type: GraphQLID,
      description: 'The foreign key to link a reflection to its group'
    },
    retroReflectionGroup: {
      type: RetroReflectionGroup,
      description: 'The group the reflection belongs to, if any',
      resolve: async ({reflectionGroupId}, args, {dataLoader}) => {
        return dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
      }
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order of the reflection in the group (increments starting from 0)'
    },
    team: {
      type: RetrospectiveMeeting,
      description: 'The team that is running the meeting that contains this reflection',
      resolve: async ({meetingId}, args, {dataLoader}) => {
        const meeting = dataLoader.get('newMeetings').load(meetingId)
        return dataLoader.get('teams').load(meeting.teamId)
      }
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description:
        'The timestamp the meeting was updated. Used to determine how long it took to write a reflection'
    }
  })
})

export default RetroReflection
