import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertIntegrationDimensionFieldMap from '../../../postgres/queries/upsertIntegrationDimensionFieldMap'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import validateDimensionFieldMutation from './helpers/validateDimensionFieldMutation'

const updateAzureDevOpsDimensionField: MutationResolvers['updateAzureDevOpsDimensionField'] =
  async (
    _source,
    {dimensionName, fieldName, meetingId, instanceId, projectKey, workItemType},
    {dataLoader, socketId: mutatorId}
  ) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // VALIDATION
    const meeting = await validateDimensionFieldMutation(dataLoader, meetingId, dimensionName)
    if (meeting instanceof Error) return {error: {message: meeting.message}}
    const {teamId} = meeting

    // RESOLUTION
    const repoId = AzureDevOpsProjectId.join(instanceId, projectKey)
    await upsertIntegrationDimensionFieldMap({
      teamId,
      service: 'azureDevOps',
      repoId,
      issueType: workItemType,
      dimensionName,
      fieldId: fieldName,
      fieldName: null,
      fieldType: 'string'
    })
    dataLoader
      .get('integrationDimensionFieldMaps')
      .clear({teamId, service: 'azureDevOps', repoId, dimensionName})

    const data = {teamId, meetingId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'UpdateAzureDevOpsDimensionFieldSuccess',
      data,
      subOptions
    )
    return data
  }

export default updateAzureDevOpsDimensionField
