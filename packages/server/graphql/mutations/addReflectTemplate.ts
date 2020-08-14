import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {PALETTE} from '../../../client/styles/paletteV2'
import {MeetingTypeEnum} from '../../../client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import ReflectTemplate from '../../database/types/ReflectTemplate'
import RetrospectivePrompt from '../../database/types/RetrospectivePrompt'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddReflectTemplatePayload from '../types/AddReflectTemplatePayload'
import makeRetroTemplates from './helpers/makeRetroTemplates'

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
  async resolve(_source, {parentTemplateId, teamId}, {authToken, dataLoader, socketId: mutatorId}) {
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
      .table('ReflectTemplate')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .run()

    if (allTemplates.length >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
      return standardError(new Error('Too many templates'), {userId: viewerId})
    }
    const viewerTeam = await dataLoader.get('teams').load(teamId)
    let data
    if (parentTemplateId) {
      const parentTemplate = await dataLoader.get('reflectTemplates').load(parentTemplateId)
      if (!parentTemplate) {
        return standardError(new Error('Parent template not found'), {userId: viewerId})
      }
      const {name, scope} = parentTemplate
      if (scope === 'TEAM') {
        if (!isTeamMember(authToken, parentTemplate.teamId))
          return standardError(new Error('Template is scoped to team'), {userId: viewerId})
      } else if (scope === 'ORGANIZATION') {
        const parentTemplateTeam = await dataLoader.get('teams').load(parentTemplate.teamId)
        if (viewerTeam.orgId !== parentTemplateTeam.orgId) {
          return standardError(new Error('Template is scoped to organization'), {userId: viewerId})
        }
      }
      const copyName = `${name} Copy`
      const existingCopyCount = await r
        .table('ReflectTemplate')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .filter((row) => row('name').match(`^${copyName}`) as any)
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
      const newTemplatePrompts = prompts.map((prompt) => {
        return new RetrospectivePrompt({
          ...prompt,
          teamId,
          templateId: newTemplate.id,
          parentPromptId: prompt.id
        })
      })
      await r({
        newTemplate: r.table('ReflectTemplate').insert(newTemplate),
        newTemplatePrompts: r.table('ReflectPrompt').insert(newTemplatePrompts),
        settings: r
          .table('MeetingSettings')
          .getAll(teamId, {index: 'teamId'})
          .filter({
            meetingType: MeetingTypeEnum.retrospective
          })
          .update({
            selectedTemplateId: newTemplate.id
          })
      }).run()
      data = {templateId: newTemplate.id}
    } else {
      if (allTemplates.find((template) => template.name === '*New Template')) {
        return standardError(new Error('Template already created'), {userId: viewerId})
      }
      const team = await dataLoader.get('teams').load(teamId)
      const {orgId} = team
      // RESOLUTION
      const base = {
        '*New Template': [
          {
            question: 'New prompt',
            description: '',
            groupColor: PALETTE.PROMPT_GREEN
          }
        ]
      }
      const {reflectPrompts: newTemplatePrompts, templates} = makeRetroTemplates(
        teamId,
        orgId,
        base
      )
      const [newTemplate] = templates
      const {id: templateId} = newTemplate
      await r({
        newTemplate: r.table('ReflectTemplate').insert(newTemplate),
        newTemplatePrompts: r.table('ReflectPrompt').insert(newTemplatePrompts),
        settings: r
          .table('MeetingSettings')
          .getAll(teamId, {index: 'teamId'})
          .filter({
            meetingType: MeetingTypeEnum.retrospective
          })
          .update({
            selectedTemplateId: templateId
          })
      }).run()
      data = {templateId}
    }
    publish(SubscriptionChannel.TEAM, teamId, 'AddReflectTemplatePayload', data, subOptions)
    return data
  }
}

export default addReflectTemplate
