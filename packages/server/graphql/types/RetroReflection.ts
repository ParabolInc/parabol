import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import Reflection from '../../database/types/Reflection'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import {resolveForSU} from '../resolvers'
import GoogleAnalyzedEntity from './GoogleAnalyzedEntity'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import Reactji from './Reactji'
import RetroPhaseItem from './RetroPhaseItem'
import RetroReflectionGroup from './RetroReflectionGroup'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import Team from './Team'
import getGroupedReactjis from '../../utils/getGroupedReactjis'

const RetroReflection = new GraphQLObjectType<Reflection, GQLContext>({
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
      resolve: resolveForSU('autoReflectionGroupId')
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
    editorIds: {
      description: 'an array of all the socketIds that are currently editing the reflection',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      resolve: () => []
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'True if the reflection was not removed, else false',
      resolve: ({isActive}) => !!isActive
    },
    isViewerCreator: {
      description: 'true if the viewer (userId) is the creator of the retro reflection, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({creatorId}, _args, {authToken}) => {
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
      type: new GraphQLNonNull(GraphQLID),
      description: 'The foreign key to link a reflection to its meeting'
    },
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      description: 'The retrospective meeting this reflection was created in',
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    phaseItem: {
      type: new GraphQLNonNull(RetroPhaseItem),
      resolve: ({retroPhaseItemId}, _args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(retroPhaseItemId)
      }
    },
    plaintextContent: {
      description: 'The plaintext version of content',
      type: new GraphQLNonNull(GraphQLString)
    },
    reactjis: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(Reactji))),
      description: 'All the reactjis for the given reflection',
      resolve: ({reactjis, id: reflectionId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return getGroupedReactjis(reactjis, viewerId, reflectionId)
      }
    },
    retroPhaseItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The foreign key to link a reflection to its phaseItem. Immutable. For sorting, use phase item on the group.'
    },
    reflectionGroupId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The foreign key to link a reflection to its group'
    },
    retroReflectionGroup: {
      type: RetroReflectionGroup,
      description: 'The group the reflection belongs to, if any',
      resolve: async ({reflectionGroupId}, _args, {dataLoader}) => {
        return dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
      }
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order of the reflection in the group (increments starting from 0)'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team that is running the meeting that contains this reflection',
      resolve: async ({meetingId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
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
