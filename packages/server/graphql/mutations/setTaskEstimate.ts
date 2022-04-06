import {GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import TaskIntegrationJiraServer from '../../database/types/TaskIntegrationJiraServer'
import JiraProjectKeyId from '../../../client/shared/gqlIds/JiraProjectKeyId'
import appOrigin from '../../appOrigin'
import MeetingPoker from '../../database/types/MeetingPoker'
import JiraServerRestManager from '../../integrations/jiraServer/JiraServerRestManager'
import {IntegrationProviderJiraServer} from '../../postgres/queries/getIntegrationProvidersByIds'
import insertTaskEstimate from '../../postgres/queries/insertTaskEstimate'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import {fieldTypeToId} from '../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import AzureDevOpsServerManager from '../../utils/AzureDevOpsServerManager'
import getPhase from '../../utils/getPhase'
import makeScoreJiraComment from '../../utils/makeScoreJiraComment'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import SetTaskEstimatePayload from '../types/SetTaskEstimatePayload'
import TaskEstimateInput, {ITaskEstimateInput} from '../types/TaskEstimateInput'
import pushEstimateToGitHub from './helpers/pushEstimateToGitHub'
import pushEstimateToGitLab from './helpers/pushEstimateToGitLab'

const setTaskEstimate = {
  type: new GraphQLNonNull(SetTaskEstimatePayload),
  description: 'Update a task estimate',
  args: {
    taskEstimate: {
      type: new GraphQLNonNull(TaskEstimateInput)
    }
  },
  resolve: async (
    _source: unknown,
    {taskEstimate}: {taskEstimate: ITaskEstimateInput},
    context: GQLContext,
    info: GraphQLResolveInfo
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const {taskId, value, dimensionName, meetingId} = taskEstimate

    //AUTH
    const [task, meeting] = await Promise.all([
      dataLoader.get('tasks').load(taskId),
      dataLoader.get('newMeetings').load(meetingId)
    ])
    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    if (!task) {
      return {error: {message: 'Task not found'}}
    }
    const {teamId} = task
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }

    // VALIDATION
    if (value.length > 4) {
      return {error: {message: 'Estimate score is too long'}}
    }
    if (dimensionName.length === 0 || dimensionName.length > Threshold.MAX_POKER_DIMENSION_NAME) {
      return {error: {message: 'Invalid dimension name'}}
    }

    const {phases, meetingType, templateRefId, name: meetingName} = meeting as MeetingPoker
    if (meetingType !== 'poker') {
      return {error: {message: 'Invalid poker meeting'}}
    }
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
    let jiraFieldId: string | undefined = undefined
    let githubLabelName: string | undefined = undefined
    const {integration} = task
    const service = integration?.service
    const stageIdx = stages.findIndex((stage) => stage.id === stageId)
    const discussionURL = makeAppURL(appOrigin, `meet/${meetingId}/estimate/${stageIdx + 1}`)

    if (service === 'jira') {
      const {accessUserId, cloudId, issueKey} = integration!
      const projectKey = JiraProjectKeyId.join(issueKey)
      const [auth, team] = await Promise.all([
        dataLoader.get('freshAtlassianAuth').load({teamId, userId: accessUserId}),
        dataLoader.get('teams').load(teamId)
      ])
      if (!auth) {
        return {error: {message: 'User no longer has access to Atlassian'}}
      }
      const {accessToken} = auth
      const manager = new AtlassianServerManager(accessToken)
      const jiraDimensionFields = team?.jiraDimensionFields || []
      const dimensionField = jiraDimensionFields.find(
        (dimensionField) =>
          dimensionField.dimensionName === dimensionName &&
          dimensionField.cloudId === cloudId &&
          dimensionField.projectKey === projectKey
      )
      const fieldName = dimensionField?.fieldName ?? SprintPokerDefaults.SERVICE_FIELD_NULL
      if (fieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
        const res = await manager.addComment(
          cloudId,
          issueKey,
          makeScoreJiraComment(dimensionName, value || '<None>', meetingName, discussionURL)
        )
        if ('message' in res) {
          return {error: {message: res.message}}
        }
      } else if (fieldName !== SprintPokerDefaults.SERVICE_FIELD_NULL) {
        const {fieldId, fieldType} = dimensionField!
        jiraFieldId = fieldId
        try {
          const updatedStoryPoints = fieldType === 'string' ? value : Number(value)

          await manager.updateStoryPoints(cloudId, issueKey, updatedStoryPoints, fieldId)
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Unable to updateStoryPoints'
          return {error: {message}}
        }
      }
    } else if (service === 'jiraServer') {
      const {accessUserId, issueId} = integration!

      const [auth /*, team*/] = await Promise.all([
        dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId: accessUserId}),
        dataLoader.get('teams').load(teamId)
      ])

      if (!auth) {
        return {error: {message: 'User no longer has access to Jira Server'}}
      }

      const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)

      if (!provider) {
        return null
      }

      const manager = new JiraServerRestManager(auth, provider as IntegrationProviderJiraServer)

      const {providerId, repositoryId: projectId} = integration as TaskIntegrationJiraServer
      const existingDimensionField = await dataLoader.get('jiraServerDimensionFieldMap').load({providerId, projectId, teamId, dimensionName})

      const fieldId = existingDimensionField?.fieldId ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT

      if (fieldId === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
        const res = await manager.addScoreComment(
          dimensionName,
          value || '<None>',
          meetingName,
          discussionURL,
          issueId
        )

        if (res instanceof Error) {
          return {error: {message: res.message}}
        }
      }
      else {
        const updatedStoryPoints = existingDimensionField?.fieldType === 'number' ? Number(value) : value
        const res = await manager.setField(issueId, fieldId, updatedStoryPoints)        
        if (res instanceof Error) {
          return {error: {message: res.message}}
        }
      }
    } else if (service === 'github') {
      const githubPushRes = await pushEstimateToGitHub(taskEstimate, context, info, stageId)
      if (githubPushRes instanceof Error) {
        const {message} = githubPushRes
        return {error: {message}}
      }
      githubLabelName = githubPushRes
    } else if (service === 'azureDevOps') {
      const {accessUserId, instanceId, issueKey, projectKey} = integration!
      const [auth, azureDevOpsDimensionFieldMapEntry, azureDevOpsWorkItem] = await Promise.all([
        dataLoader.get('freshAzureDevOpsAuth').load({teamId, userId: accessUserId}),
        dataLoader
          .get('azureDevOpsDimensionFieldMap')
          .load({teamId, dimensionName, instanceId, projectKey}),
        dataLoader.get('azureDevOpsWorkItem').load({
          teamId,
          userId: accessUserId,
          instanceId,
          projectId: projectKey,
          viewerId: accessUserId,
          workItemId: issueKey
        })
      ])

      if (!auth) {
        return {error: {message: 'User no longer has access to Azure DevOps'}}
      }

      if (!azureDevOpsDimensionFieldMapEntry) {
        return {error: {message: 'Cannot find the correct field to push changes to.'}}
      }

      if (!azureDevOpsWorkItem) {
        return {error: {message: 'Cannot find the correct work item to push changes to.'}}
      }

      const fieldName = azureDevOpsDimensionFieldMapEntry.fieldName
      const fieldType = azureDevOpsDimensionFieldMapEntry.fieldType

      const manager = new AzureDevOpsServerManager(auth, null)

      if (fieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
        const res = await manager.addScoreComment(
          instanceId,
          dimensionName,
          value,
          meetingName,
          discussionURL,
          issueKey,
          projectKey
        )
        if ('message' in res) {
          return {error: {message: res.message}}
        }
      } else if (fieldName !== SprintPokerDefaults.SERVICE_FIELD_NULL) {
        const fieldId = fieldTypeToId[azureDevOpsWorkItem.type]
        try {
          const updatedStoryPoints = fieldType === 'string' ? value : Number(value)
          await manager.addScoreField(instanceId, fieldId, updatedStoryPoints, issueKey, projectKey)
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Unable to updateStoryPoints'
          return {error: {message}}
        }
      }
    } else if (service === 'gitlab') {
      const gitlabPushRes = await pushEstimateToGitLab(taskEstimate, context, info, stageId)
      if (gitlabPushRes instanceof Error) {
        const {message} = gitlabPushRes
        return {error: {message}}
      }
    }

    await insertTaskEstimate({
      changeSource: meeting ? 'meeting' : 'task',
      discussionId,
      jiraFieldId,
      githubLabelName,
      label: value,
      name: dimensionName,
      meetingId,
      stageId,
      taskId,
      userId: viewerId
    })

    const data = {meetingId, stageId, taskId}
    publish(SubscriptionChannel.MEETING, meetingId, 'SetTaskEstimateSuccess', data, subOptions)
    return data
  }
}

export default setTaskEstimate
