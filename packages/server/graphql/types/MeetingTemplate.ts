import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import db from '../../db'
import {GQLContext} from './../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import SharingScopeEnum from './SharingScopeEnum'
import Team from './Team'

export const meetingTemplateFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  },
  isActive: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'True if template can be used, else false'
  },
  isFree: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description:
      'True if template is available to all teams including non-paying teams, else false',
    resolve: async ({id: templateId, isFree}: {id: string; isFree?: boolean}) => {
      const endTimes = await db.readMany('endTimesByTemplateId', [templateId])
      const hasUsedTemplate = !!endTimes[0]?.length
      if (hasUsedTemplate) return true // if the team used a premium template before we implemented the restriction, let them use it
      return !!isFree
    }
  },
  lastUsedAt: {
    type: GraphQLISO8601Type,
    description: 'The time of the meeting the template was last used'
  },
  name: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'The name of the template'
  },
  orgId: {
    type: new GraphQLNonNull(GraphQLID),
    description: '*Foreign key. The organization that owns the team that created the template'
  },
  scope: {
    type: new GraphQLNonNull(SharingScopeEnum),
    description: 'Who can see this template'
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: '*Foreign key. The team this template belongs to'
  },
  team: {
    type: new GraphQLNonNull(Team),
    description: 'The team this template belongs to',
    resolve: async ({teamId}: {teamId: string}, _args: unknown, {dataLoader}: GQLContext) => {
      const team = await dataLoader.get('teams').load(teamId)
      return team
    }
  },
  type: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'The type of the template'
  },
  updatedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  }
})

const MeetingTemplate = new GraphQLInterfaceType({
  name: 'MeetingTemplate',
  description: 'A meeting template that can be shared across team, orgnization and public',
  fields: meetingTemplateFields
})

export default MeetingTemplate
