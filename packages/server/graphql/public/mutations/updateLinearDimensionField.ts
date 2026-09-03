import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertIntegrationDimensionFieldMap from '../../../postgres/queries/upsertIntegrationDimensionFieldMap'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import validateDimensionFieldMutation from './helpers/validateDimensionFieldMutation'

const updateLinearDimensionField: MutationResolvers['updateLinearDimensionField'] = async (
  _source,
  {dimensionName, labelTemplate, meetingId, repoId},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const meeting = await validateDimensionFieldMutation(dataLoader, meetingId, dimensionName)
  if (meeting instanceof Error) {
    return {error: {message: meeting.message}}
  }
  const {teamId} = meeting

  // RESOLUTION
  await upsertIntegrationDimensionFieldMap({
    teamId,
    service: 'linear',
    repoId,
    issueType: null,
    dimensionName,
    fieldId: labelTemplate,
    fieldName: null,
    fieldType: 'string'
  })
  dataLoader
    .get('integrationDimensionFieldMaps')
    .clear({teamId, service: 'linear', repoId, dimensionName})

  const data = {meetingId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateLinearDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateLinearDimensionField
