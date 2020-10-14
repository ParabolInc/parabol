import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RenamePokerTemplatePayload from '../types/RenamePokerTemplatePayload'

const renamePokerTemplate = {
  description: 'Rename a Poker template',
  type: new GraphQLNonNull(RenamePokerTemplatePayload),
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_source, {templateId, name}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const template = await r
      .table('MeetingTemplate')
      .get(templateId)
      .run()
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, template.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (!template || !template.isActive) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = template
    const trimmedName = name.trim().slice(0, 100)
    const normalizedName = trimmedName || 'Unnamed Template'
    const allTemplates = await r
      .table('MeetingTemplate')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true, type: MeetingTypeEnum.poker})
      .run()
    if (allTemplates.find((template) => template.name === normalizedName)) {
      return standardError(new Error('Duplicate template name'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('MeetingTemplate')
      .get(templateId)
      .update({name: normalizedName, updatedAt: now})
      .run()

    const data = {templateId}
    publish(SubscriptionChannel.TEAM, teamId, 'RenamePokerTemplatePayload', data, subOptions)
    return data
  }
}

export default renamePokerTemplate
