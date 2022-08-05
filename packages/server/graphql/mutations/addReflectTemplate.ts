import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {PALETTE} from '../../../client/styles/paletteV3'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import ReflectTemplate from '../../database/types/ReflectTemplate'
import RetrospectivePrompt from '../../database/types/RetrospectivePrompt'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddReflectTemplatePayload from '../types/AddReflectTemplatePayload'
import makeRetroTemplates from './helpers/makeRetroTemplates'
import sendTemplateEventToSegment from './helpers/sendTemplateEventToSegment'

const addReflectTemplate = {
  description: 'Add a new template full of prompts',
  type: AddReflectTemplatePayload,
  args: {
    parentTemplateId: {
      type: GraphQLID
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {parentTemplateId, teamId}: {parentTemplateId?: string | null; teamId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const allTemplates = await r
      .table('MeetingTemplate')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .filter({type: 'retrospective'})
      .run()

    if (allTemplates.length >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
      return standardError(new Error('Too many templates'), {userId: viewerId})
    }
    const viewerTeam = await dataLoader.get('teams').load(teamId)
    if (!viewerTeam) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    let data
    if (parentTemplateId) {
      const parentTemplate = await dataLoader.get('meetingTemplates').load(parentTemplateId)
      if (!parentTemplate) {
        return standardError(new Error('Parent template not found'), {userId: viewerId})
      }
      const {name, scope} = parentTemplate
      if (scope === 'TEAM') {
        if (!isTeamMember(authToken, parentTemplate.teamId))
          return standardError(new Error('Template is scoped to team'), {userId: viewerId})
      } else if (scope === 'ORGANIZATION') {
        const parentTemplateTeam = await dataLoader.get('teams').load(parentTemplate.teamId)
        if (viewerTeam.orgId !== parentTemplateTeam?.orgId) {
          return standardError(new Error('Template is scoped to organization'), {userId: viewerId})
        }
      }
      const copyName = `${name} Copy`
      const existingCopyCount = await r
        .table('MeetingTemplate')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .filter({type: 'retrospective'})
        .filter((row: RDatum) => row('name').match(`^${copyName}`) as any)
        .count()
        .run()
      const newName = existingCopyCount === 0 ? copyName : `${copyName} #${existingCopyCount + 1}`
      const newTemplate = new ReflectTemplate({
        name: newName,
        teamId,
        orgId: viewerTeam.orgId,
        parentTemplateId
      })
      const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(parentTemplate.id)
      const activePrompts = prompts.filter(({removedAt}: RetrospectivePrompt) => !removedAt)
      const newTemplatePrompts = activePrompts.map((prompt: RetrospectivePrompt) => {
        return new RetrospectivePrompt({
          ...prompt,
          teamId,
          templateId: newTemplate.id,
          parentPromptId: prompt.id,
          removedAt: null
        })
      })
      await r({
        newTemplate: r.table('MeetingTemplate').insert(newTemplate),
        newTemplatePrompts: r.table('ReflectPrompt').insert(newTemplatePrompts)
      }).run()
      sendTemplateEventToSegment(viewerId, newTemplate, 'Template Cloned')
      data = {templateId: newTemplate.id}
    } else {
      if (allTemplates.find((template) => template.name === '*New Template')) {
        return standardError(new Error('Template already created'), {userId: viewerId})
      }
      const {orgId} = viewerTeam
      // RESOLUTION
      const base = {
        '*New Template': [
          {
            question: 'New prompt',
            description: '',
            groupColor: PALETTE.JADE_400
          }
        ]
      } as const
      const {reflectPrompts: newTemplatePrompts, templates} = makeRetroTemplates(
        teamId,
        orgId,
        base
      )
      // guaranteed since base has 1 key
      const newTemplate = templates[0]!
      const {id: templateId} = newTemplate
      await r({
        newTemplate: r.table('MeetingTemplate').insert(newTemplate),
        newTemplatePrompts: r.table('ReflectPrompt').insert(newTemplatePrompts)
      }).run()
      sendTemplateEventToSegment(viewerId, newTemplate, 'Template Created')
      data = {templateId}
    }
    publish(SubscriptionChannel.TEAM, teamId, 'AddReflectTemplatePayload', data, subOptions)
    return data
  }
}

export default addReflectTemplate
