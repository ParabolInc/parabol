import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertIntegrationDimensionFieldMap from '../../../postgres/queries/upsertIntegrationDimensionFieldMap'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import validateDimensionFieldMutation from './helpers/validateDimensionFieldMutation'

const updateGitLabDimensionField: MutationResolvers['updateGitLabDimensionField'] = async (
  _source,
  {dimensionName, labelTemplate, meetingId, projectId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const meeting = await validateDimensionFieldMutation(dataLoader, meetingId, dimensionName)
  if (meeting instanceof Error) {
    return {error: {message: meeting.message}}
  }
  const {teamId} = meeting
  const viewerId = getUserId(authToken)
  const gitlabAuth = await dataLoader
    .get('freshAuth')
    .load({service: 'gitlab', teamId, userId: viewerId})
  if (!gitlabAuth?.providerId) return {error: {message: 'Invalid dimension name'}}

  // TODO validate labelTemplate

  // RESOLUTION
  const {providerId} = gitlabAuth
  const repoId = `${providerId}:${projectId}`
  await upsertIntegrationDimensionFieldMap({
    teamId,
    service: 'gitlab',
    repoId,
    workItemType: '',
    dimensionName,
    fieldId: labelTemplate,
    fieldName: labelTemplate,
    fieldType: 'string'
  })
  dataLoader
    .get('integrationDimensionFieldMaps')
    .clear({teamId, service: 'gitlab', repoId, dimensionName})

  const data = {meetingId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateGitLabDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateGitLabDimensionField
