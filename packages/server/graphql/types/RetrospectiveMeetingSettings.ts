import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import db from '../../db'
import getTemplateScore from '../../utils/getTemplateScore'
import {GQLContext} from '../graphql'
import ReflectTemplate, {ReflectTemplateConnection} from './ReflectTemplate'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'

const getPublicScoredTemplates = async (templates: {createdAt: Date; id: string}[]) => {
  const sharedTemplateIds = templates.map(({id}) => id)
  const sharedTemplateEndTimes = await db.readMany('endTimesByTemplateId', sharedTemplateIds)
  const scoreByTemplateId = {} as {[templateId: string]: number}
  const starterTemplates = new Set([
    'sailboatTemplate',
    'startStopContinueTemplate',
    'workingStuckTemplate',
    'fourLsTemplate',
    'gladSadMadTemplate'
  ])
  templates.forEach((template, idx) => {
    const {id: templateId, createdAt} = template
    const endTimes = sharedTemplateEndTimes[idx]
    const starterBonus = starterTemplates.has(templateId) ? 100 : 0
    const minUsagePenalty = sharedTemplateEndTimes.length < 10 && !starterBonus
    scoreByTemplateId[templateId] = minUsagePenalty
      ? -1
      : getTemplateScore(createdAt, endTimes, 0.2) + starterBonus
  })
  // mutative, but doesn't matter if we change the sort oder
  return templates
    .sort((a, b) => {
      return scoreByTemplateId[a.id] > scoreByTemplateId[b.id] ? -1 : 1
    })
    .filter((template) => scoreByTemplateId[template.id] > 0)
}

const getScoredTemplates = async (
  templates: {createdAt: Date; id: string}[],
  newHotnessFactor: number
) => {
  const sharedTemplateIds = templates.map(({id}) => id)
  const sharedTemplateEndTimes = await db.readMany('endTimesByTemplateId', sharedTemplateIds)
  const scoreByTemplateId = {} as {[templateId: string]: number}
  templates.forEach((template, idx) => {
    const {id: templateId, createdAt} = template
    const endTimes = sharedTemplateEndTimes[idx]
    scoreByTemplateId[templateId] = getTemplateScore(createdAt, endTimes, newHotnessFactor)
  })
  // mutative, but doesn't matter if we change the sort oder
  templates.sort((a, b) => {
    return scoreByTemplateId[a.id] > scoreByTemplateId[b.id] ? -1 : 1
  })
  return templates
}

const connectionFromTemplateArray = (
  scoredTemplates: {createdAt: Date; id: string}[],
  first: number,
  after: string
) => {
  const startIdx = after ? scoredTemplates.findIndex((template) => template.id === after) : 0
  const safeStartIdx = startIdx === -1 ? 0 : startIdx
  const nodes = scoredTemplates.slice(safeStartIdx, first)
  const edges = nodes.map((node) => ({
    cursor: node.id,
    node
  }))
  const firstEdge = edges[0]
  return {
    edges,
    pageInfo: {
      startCursor: firstEdge && firstEdge.cursor,
      endCursor: firstEdge ? edges[edges.length - 1].cursor : '',
      hasNextPage: scoredTemplates.length > nodes.length
    }
  }
}

const RetrospectiveMeetingSettings = new GraphQLObjectType<any, GQLContext>({
  name: 'RetrospectiveMeetingSettings',
  description: 'The retro-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields(),
    totalVotes: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes each team member receives for the voting phase'
    },
    maxVotesPerGroup: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The maximum number of votes a team member can vote for a single reflection group'
    },
    selectedTemplateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK. The template that will be used to start the retrospective'
    },
    selectedTemplate: {
      type: GraphQLNonNull(ReflectTemplate),
      description: 'The template that will be used to start the retrospective',
      resolve: async (source, _args, {dataLoader}) => {
        const {id: settingsId, selectedTemplateId} = source
        const template = await dataLoader.get('reflectTemplates').load(selectedTemplateId)
        if (template) return template
        // there may be holes in our template deletion or reselection logic, so doing this to be safe
        const safeTemplateId = 'workingStuckTemplate'
        source.selectedTemplateId = safeTemplateId
        const r = await getRethink()
        await r
          .table('MeetingSettings')
          .get(settingsId)
          .update({selectedTemplateId: safeTemplateId})
          .run()
        return dataLoader.get('reflectTemplates').load(safeTemplateId)
      }
    },
    reflectTemplates: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectTemplate))),
      description: 'The list of templates used to start a retrospective',
      deprecatedReason: 'renamed to teamTemplates',
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectTemplatesByTeamId').load(teamId)
      }
    },
    teamTemplates: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectTemplate))),
      description: 'The list of templates used to start a retrospective',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        const templates = await dataLoader.get('reflectTemplatesByTeamId').load(teamId)
        const scoredTemplates = await getScoredTemplates(templates, 0.9)
        return scoredTemplates
      }
    },
    organizationTemplates: {
      type: GraphQLNonNull(ReflectTemplateConnection),
      args: {
        first: {
          type: GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLID,
          description: 'The cursor, which is the templateId'
        }
      },
      description: 'The list of templates shared across the organization to start a retrospective',
      resolve: async ({teamId}, {first, after}, {dataLoader}) => {
        const team = await dataLoader.get('teams').load(teamId)
        const {orgId} = team
        const templates = await dataLoader.get('reflectTemplatesByOrgId').load(orgId)
        const organizationTemplates = templates.filter(
          (template) => template.scope !== 'TEAM' && template.teamId !== teamId
        )
        const scoredTemplates = await getScoredTemplates(organizationTemplates, 0.8)
        return connectionFromTemplateArray(scoredTemplates, first, after)
      }
    },
    publicTemplates: {
      type: GraphQLNonNull(ReflectTemplateConnection),
      description: 'The list of templates shared across the organization to start a retrospective',
      args: {
        first: {
          type: GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLID,
          description: 'The cursor, which is the templateId'
        }
      },
      resolve: async ({teamId}, {first, after}, {dataLoader}) => {
        const [publicTemplates, team] = await Promise.all([
          db.read('publicTemplates', 'all'),
          dataLoader.get('teams').load(teamId)
        ])
        const {orgId} = team
        const unownedTemplates = publicTemplates.filter((template) => template.orgId !== orgId)
        const scoredTemplates = await getPublicScoredTemplates(unownedTemplates)
        return connectionFromTemplateArray(scoredTemplates, first, after)
      }
    }
  })
})

export default RetrospectiveMeetingSettings
