import {GraphQLError} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getServerIntegration} from '../../../integrations/platform/registry'
import type {DimensionFieldTarget} from '../../../integrations/platform/ServerIntegrationDefinition'
import upsertIntegrationDimensionFieldMap from '../../../postgres/queries/upsertIntegrationDimensionFieldMap'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import validateDimensionFieldMutation from './helpers/validateDimensionFieldMutation'

const SENTINELS: string[] = [
  SprintPokerDefaults.SERVICE_FIELD_COMMENT,
  SprintPokerDefaults.SERVICE_FIELD_NULL
]

const updateIntegrationDimensionField: MutationResolvers['updateIntegrationDimensionField'] =
  async (_source, {meetingId, taskId, dimensionName, fieldId}, context, info) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    const meeting = await validateDimensionFieldMutation(dataLoader, meetingId, dimensionName)
    if (meeting instanceof Error) throw new GraphQLError(meeting.message)
    const {teamId} = meeting
    const task = await dataLoader.get('tasks').load(taskId)
    if (!task || task.teamId !== teamId) throw new GraphQLError('Task not found')
    const {integration} = task
    if (!integration) throw new GraphQLError('Task is not integrated')
    const {service, accessUserId} = integration
    const {estimatePush} = getServerIntegration(service).capabilities

    const ctx = {dataLoader, teamId, userId: accessUserId, context, info, task, viewerId}
    const key = await estimatePush.resolveDimensionFieldKey(ctx)
    if (!key) throw new GraphQLError('Issue not found')
    if (!SENTINELS.includes(fieldId) && estimatePush.targets.includes('field')) {
      const {options} = await estimatePush.listDimensionFields(ctx)
      if (!options.some((option) => option.fieldId === fieldId)) {
        throw new GraphQLError('That field is not available on this issue')
      }
    }
    const target: DimensionFieldTarget | Error = SENTINELS.includes(fieldId)
      ? {fieldId, fieldName: null, fieldType: 'string'}
      : await estimatePush.describeDimensionField(ctx, key, fieldId)
    if (target instanceof Error) throw new GraphQLError(target.message)

    await upsertIntegrationDimensionFieldMap({
      teamId,
      service,
      repoId: key.repoId,
      issueType: key.issueType,
      dimensionName,
      ...target
    })
    dataLoader
      .get('integrationDimensionFieldMaps')
      .clear({teamId, service, repoId: key.repoId, dimensionName})

    const data = {teamId, meetingId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'UpdateIntegrationDimensionFieldSuccess',
      data,
      subOptions
    )
    return data
  }

export default updateIntegrationDimensionField
