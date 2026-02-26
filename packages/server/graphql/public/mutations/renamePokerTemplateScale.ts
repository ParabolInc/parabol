import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const renamePokerTemplateScale: MutationResolvers['renamePokerTemplateScale'] = async (
  _source,
  {scaleId, name},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const scale = await dataLoader.get('templateScales').load(scaleId)
  const viewerId = getUserId(authToken)

  // AUTH
  if (!scale || scale.removedAt) {
    return standardError(new Error('Scale not found'), {userId: viewerId})
  }
  if (!isTeamMember(authToken, scale.teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // VALIDATION
  const {teamId} = scale
  const trimmedName = name.trim().slice(0, 50)
  const normalizedName = trimmedName || 'Unnamed Scale'

  const allScales = await dataLoader.get('scalesByTeamId').load(teamId)
  if (allScales.find((scale) => scale.name === normalizedName)) {
    return standardError(new Error('Duplicate name scale'), {
      userId: viewerId
    })
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
