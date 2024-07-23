import {GraphQLID, GraphQLNonNull} from 'graphql'
import {sql} from 'kysely'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RemovePokerTemplateScalePayload from '../types/RemovePokerTemplateScalePayload'

const removePokerTemplateScale = {
  description: 'Remove a scale from a template',
  type: new GraphQLNonNull(RemovePokerTemplateScalePayload),
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {scaleId}: {scaleId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const pg = getKysely()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const scale = await dataLoader.get('templateScales').load(scaleId)
    const viewerId = getUserId(authToken)

    // AUTH
    if (!scale || scale.removedAt) {
      return standardError(new Error('Scale not found'), {userId: viewerId})
    }
    const {teamId} = scale
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await pg
      .updateTable('TemplateScale')
      .set({removedAt: sql`CURRENT_TIMESTAMP`})
      .where('id', '=', scaleId)
      .execute()

    const nextDefaultScaleId = SprintPokerDefaults.DEFAULT_SCALE_ID
    const dimensions = await r
      .table('TemplateDimension')
      .getAll(teamId, {index: 'teamId'})
      .filter((row: RDatum) =>
        row('removedAt').default(null).eq(null).and(row('scaleId').eq(scaleId))
      )
      .update(
        {
          scaleId: nextDefaultScaleId,
          updatedAt: now
        },
        {returnChanges: true}
      )('changes')('new_val')
      .default([])
      .run()
    // mark templates as updated
    const updatedTemplateIds = dimensions.map(({templateId}: any) => templateId)
    await pg
      .updateTable('MeetingTemplate')
      .set({updatedAt: now})
      .where('id', 'in', updatedTemplateIds)
      .execute()

    const data = {scaleId, dimensions}
    publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplateScalePayload', data, subOptions)
    return data
  }
}

export default removePokerTemplateScale
