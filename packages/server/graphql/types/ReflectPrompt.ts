import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import ReflectTemplate from './ReflectTemplate'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import Team from './Team'

const ReflectPrompt: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectPrompt',
  description:
    'A team-specific reflection prompt. Usually 3 or 4 exist per team, eg Good/Bad/Change, 4Ls, etc.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key. use the team field'
    },
    team: {
      type: Team,
      description: 'The team that owns this reflectPrompt',
      resolve: resolveTeam
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the order of the items in the template'
    },
    meetingId: {
      type: GraphQLID,
      description: 'ID of the meeting if this is a one off prompt'
    },
    meeting: {
      type: RetrospectiveMeeting,
      description: 'The meeting if this is a one off prompt'
    },
    templateId: {
      type: GraphQLID,
      description: 'FK for template, can be null if the prompt is meeting specific'
    },
    template: {
      type: ReflectTemplate,
      description: 'The template that this prompt belongs to, can be null if the prompt is meeting specific',
      resolve: ({templateId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    question: {
      description:
        'The question to answer during the phase of the retrospective (eg What went well?)',
      type: new GraphQLNonNull(GraphQLString)
    },
    description: {
      description:
        'The description to the question for further context. A long version of the question.',
      type: new GraphQLNonNull(GraphQLString),
      resolve: ({description}) => description || ''
    },
    groupColor: {
      description: 'The color used to visually group a phase item.',
      type: new GraphQLNonNull(GraphQLString),
      resolve: ({groupColor}) => groupColor || '#FFFFFF'
    },
    removedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime that the prompt was removed. Null if it has not been removed.'
    }
  })
})

export default ReflectPrompt
