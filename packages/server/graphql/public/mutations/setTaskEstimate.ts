import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {MAX_FREE_JIRA_EXPORTS} from 'parabol-client/utils/constants'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {estimatePushColumns} from '../../../integrations/platform/estimatePushColumns'
import {getServerIntegration} from '../../../integrations/platform/registry'
import getKysely from '../../../postgres/getKysely'
import type {EstimatePushResult} from '../../../postgres/types/EstimatePushResult'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const setTaskEstimate: MutationResolvers['setTaskEstimate'] = async (
  _source,
  {taskEstimate},
  context,
  info
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const {taskId, value, dimensionName, meetingId} = taskEstimate

  //AUTH
  const [task, meeting, viewer] = await Promise.all([
    dataLoader.get('tasks').load(taskId),
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!meeting) {
    return {error: {message: 'Meeting not found'}}
  }
  if (!task) {
    return {error: {message: 'Task not found'}}
  }
  const {teamId} = task

  // VALIDATION
  if (value.length > 4) {
    return {error: {message: 'Estimate score is too long'}}
  }
  if (dimensionName.length === 0 || dimensionName.length > Threshold.MAX_POKER_DIMENSION_NAME) {
    return {error: {message: 'Invalid dimension name'}}
  }

  if (meeting.meetingType !== 'poker') {
    return {error: {message: 'Invalid poker meeting'}}
  }
  const {phases, templateRefId, name: meetingName} = meeting
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
  const {dimensions} = templateRef
  const dimensionRefIdx = dimensions.findIndex((dimension) => dimension.name === dimensionName)
  if (dimensionRefIdx === -1) {
    return {error: {message: 'Invalid dimensionName for meeting'}}
  }

  const estimatePhase = getPhase(phases, 'ESTIMATE')
  const {stages} = estimatePhase
  const stage = stages.find(
    (stage) => stage.taskId === taskId && stage.dimensionRefIdx === dimensionRefIdx
  )
  if (!stage) {
    return {error: {message: 'Stage not found for meetingId'}}
  }
  const discussionId = stage.discussionId
  const stageId = stage.id

  // RESOLUTION
  const {integration} = task
  const service = integration?.service
  const stageIdx = stages.findIndex((stage) => stage.id === stageId)
  const discussionURL = makeAppURL(appOrigin, `meet/${meetingId}/estimate/${stageIdx + 1}`)

  let exportCount = 0
  if (integration?.service === 'jira') {
    const {cloudId} = integration

    // Check Jira export limits for starter-tier orgs
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const org = await dataLoader.get('organizations').loadNonNull(team.orgId)
    if (org.tier === 'starter') {
      const pg = getKysely()
      const result = await pg
        .insertInto('JiraExport')
        .values({cloudId, exportCount: 1})
        .onConflict((oc) =>
          oc
            .column('cloudId')
            .doUpdateSet((eb) => ({
              exportCount: eb('JiraExport.exportCount', '+', 1)
            }))
            .where((eb) =>
              eb.or([
                eb('JiraExport.limitReachedAt', 'is', null),
                eb('JiraExport.limitReachedAt', '>', sql<Date>`now() - interval '1 day'`)
              ])
            )
        )
        .returning(['exportCount', 'limitReachedAt'])
        .executeTakeFirst()
      if (!result) {
        // No row returned means limitReachedAt is older than 1 day (conflict WHERE failed)
        throw new GraphQLError(
          'Your free Jira export limit has been reached. Please upgrade to continue.',
          {
            extensions: {code: 'UPGRADE_REQUIRED'}
          }
        )
      }

      exportCount = result.exportCount
      if (result.exportCount >= MAX_FREE_JIRA_EXPORTS && !result.limitReachedAt) {
        await pg
          .updateTable('JiraExport')
          .set({limitReachedAt: sql`now()`})
          .where('cloudId', '=', cloudId)
          .execute()
      }
    }
  }

  const pushResult: EstimatePushResult | Error = !integration
    ? null
    : await getServerIntegration(integration.service).capabilities.estimatePush.pushEstimate({
        dataLoader,
        teamId,
        userId: integration.accessUserId,
        context,
        info,
        task,
        taskEstimate,
        stageId,
        viewerId,
        meetingName,
        discussionURL
      })
  const success = !(pushResult instanceof Error)
  const errorMessage = pushResult instanceof Error ? pushResult.message : undefined

  analytics.taskEstimateSet(viewer, {
    taskId,
    meetingId,
    dimensionName,
    service,
    success,
    errorMessage
  })

  if (success) {
    await getKysely()
      .insertInto('TaskEstimate')
      .values({
        changeSource: meeting ? 'meeting' : 'task',
        discussionId,
        ...estimatePushColumns(pushResult),
        label: value,
        name: dimensionName,
        meetingId,
        stageId,
        taskId,
        userId: viewerId
      })
      .execute()

    const data = {meetingId, stageId, taskId, exportCount}
    publish(SubscriptionChannel.MEETING, meetingId, 'SetTaskEstimateSuccess', data, subOptions)
    return data
  } else {
    return {error: {message: errorMessage ?? 'Unknown error'}}
  }
}

export default setTaskEstimate
