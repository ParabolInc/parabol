import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertIntegrationDimensionFieldMap from '../../../postgres/queries/upsertIntegrationDimensionFieldMap'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import validateDimensionFieldMutation from './helpers/validateDimensionFieldMutation'

const updateGitHubDimensionField: MutationResolvers['updateGitHubDimensionField'] = async (
  _source,
  {dimensionName, labelTemplate, meetingId, nameWithOwner},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const meeting = await validateDimensionFieldMutation(dataLoader, meetingId, dimensionName)
  if (meeting instanceof Error) return {error: {message: meeting.message}}
  const {teamId} = meeting

  // RESOLUTION
  await upsertIntegrationDimensionFieldMap({
    teamId,
    service: 'github',
    repoId: nameWithOwner,
    workItemType: '',
    dimensionName,
    fieldId: labelTemplate,
    fieldName: labelTemplate,
    fieldType: 'string'
  })
  dataLoader
    .get('integrationDimensionFieldMaps')
    .clear({teamId, service: 'github', repoId: nameWithOwner, dimensionName})

  const data = {meetingId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateGitHubDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateGitHubDimensionField
