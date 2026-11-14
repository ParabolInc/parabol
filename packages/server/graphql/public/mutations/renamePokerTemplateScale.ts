import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const renamePokerTemplateScale: MutationResolvers['renamePokerTemplateScale'] = async (
  _source,
  {scaleId, name},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const scale = await dataLoader.get('templateScales').load(scaleId)

  // AUTH
  if (!scale || scale.removedAt) {
    throw new GraphQLError('Scale not found', {extensions: {code: 'NOT_FOUND'}})
  }
  // VALIDATION
  const {teamId} = scale
  const trimmedName = name.trim().slice(0, 50)
  const normalizedName = trimmedName || 'Unnamed Scale'

  const allScales = await dataLoader.get('scalesByTeamId').load(teamId)
  if (allScales.find((scale) => scale.name === normalizedName)) {
    throw new GraphQLError('Duplicate name scale', {extensions: {code: 'CONFLICT'}})
  }

  // RESOLUTION
  await pg
    .updateTable('TemplateScale')
    .set({name: normalizedName})
    .where('id', '=', scaleId)
    .execute()
  dataLoader.clearAll('templateScales')
  const data = {scaleId}
  publish(SubscriptionChannel.TEAM, teamId, 'RenamePokerTemplateScalePayload', data, subOptions)
  return data
}

export default renamePokerTemplateScale
