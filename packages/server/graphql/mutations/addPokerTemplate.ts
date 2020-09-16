import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {MeetingTypeEnum} from '../../../client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import PokerTemplate from '../../database/types/PokerTemplate'
import TemplateDimension from '../../database/types/TemplateDimension'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddPokerTemplatePayload from '../types/AddPokerTemplatePayload'
import makePokerTemplates from './helpers/makePokerTemplates'

const addPokerTemplate = {
  description: 'Add a new template full of dimensions',
  type: AddPokerTemplatePayload,
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
      .table('MeetingTemplate')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .filter({type: 'poker'})
      .run()

    if (allTemplates.length >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
      return standardError(new Error('Too many templates'), {userId: viewerId})
    }
    const viewerTeam = await dataLoader.get('teams').load(teamId)
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
        if (viewerTeam.orgId !== parentTemplateTeam.orgId) {
          return standardError(new Error('Template is scoped to organization'), {userId: viewerId})
        }
      }
      const copyName = `${name} Copy`
      const existingCopyCount = await r
        .table('MeetingTemplate')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .filter((row) => row('name').match(`^${copyName}`) as any)
        .count()
        .run()
      const newName = existingCopyCount === 0 ? copyName : `${copyName} #${existingCopyCount + 1}`
      const newTemplate = new PokerTemplate({
        name: newName,
        teamId,
        orgId: viewerTeam.orgId,
        parentTemplateId
      })
      const dimensions = await dataLoader.get('dimensionsByTemplateId').load(parentTemplate.id)
      const newTemplateDimensions = dimensions.map((dimension) => {
        return new TemplateDimension({
          ...dimension,
          teamId,
          templateId: newTemplate.id
        })
      })
      await r({
        newTemplate: r.table('MeetingTemplate').insert(newTemplate),
        newTemplateDimensions: r.table('TemplateDimension').insert(newTemplateDimensions),
        settings: r
          .table('MeetingSettings')
          .getAll(teamId, {index: 'teamId'})
          .filter({
            meetingType: MeetingTypeEnum.poker
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
            name: '*New dimension'
          }
        ]
      }
      const {
        pokerDimensions: newDimensions,
        pokerScales: newScales,
        templates
      } = makePokerTemplates(teamId, orgId, base)
      const [newTemplate] = templates
      const {id: templateId} = newTemplate
      await r({
        newTemplate: r.table('MeetingTemplate').insert(newTemplate),
        newTemplateDimensions: r.table('TemplateDimension').insert(newDimensions),
        newTemplateScales: r.table('TemplateScale').insert(newScales),
        settings: r
          .table('MeetingSettings')
          .getAll(teamId, {index: 'teamId'})
          .filter({
            meetingType: MeetingTypeEnum.poker
          })
          .update({
            selectedTemplateId: templateId
          })
      }).run()
      data = {templateId}
    }
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplatePayload', data, subOptions)
    return data
  }
}

export default addPokerTemplate
