import JiraProjectKeyId from '../../../../client/shared/gqlIds/JiraProjectKeyId'
import {SprintPokerDefaults} from '../../../../client/types/constEnums'
import TaskIntegrationAzureDevOps from '../../../database/types/TaskIntegrationAzureDevOps'
import TaskIntegrationJiraServer from '../../../database/types/TaskIntegrationJiraServer'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'
import {getUserId} from '../../../utils/authorization'
import getRedis from '../../../utils/getRedis'
import sendToSentry from '../../../utils/sendToSentry'
import isValid from '../../isValid'
import {EstimateStageResolvers} from '../resolverTypes'

const EstimateStage: EstimateStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'ESTIMATE',
  serviceField: async ({dimensionRefIdx, meetingId, teamId, taskId}, _args, context, info) => {
    const {dataLoader, authToken} = context
    const viewerId = getUserId(authToken)
    const NULL_FIELD = {name: SprintPokerDefaults.SERVICE_FIELD_NULL, type: 'string'}
    const task = await dataLoader.get('tasks').load(taskId)
    if (!task) return NULL_FIELD
    const {integration} = task
    if (!integration) return NULL_FIELD
    const {service} = integration
    const getDimensionName = async (meetingId: string) => {
      const meeting = await dataLoader.get('newMeetings').load(meetingId)
      if (meeting.meetingType !== 'poker') throw new Error('Meeting is not a poker meeting')
      const {templateRefId} = meeting
      const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
      const {dimensions} = templateRef
      const dimensionRef = dimensions[dimensionRefIdx]!
      const {name: dimensionName} = dimensionRef
      return dimensionName
    }

    if (service === 'jira') {
      const {cloudId, issueKey, accessUserId} = integration
      const projectKey = JiraProjectKeyId.join(issueKey)
      const [dimensionName, jiraIssue] = await Promise.all([
        getDimensionName(meetingId),
        dataLoader
          .get('jiraIssue')
          .load({teamId, userId: accessUserId, cloudId, issueKey, taskId, viewerId})
      ])
      if (!jiraIssue) return NULL_FIELD
      const {issueType, possibleEstimationFields} = jiraIssue

      const dimensionFields = await dataLoader
        .get('jiraDimensionFieldMap')
        .load({teamId, cloudId, projectKey, issueType, dimensionName})

      const validFieldIds = [
        SprintPokerDefaults.SERVICE_FIELD_COMMENT,
        SprintPokerDefaults.SERVICE_FIELD_NULL,
        ...possibleEstimationFields.map(({fieldId}) => fieldId)
      ]
      const dimensionField = dimensionFields.find(({fieldId}) => validFieldIds.includes(fieldId))
      if (dimensionField) {
        return {
          name: dimensionField.fieldName,
          type: dimensionField.fieldType
        }
      }

      return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
    }
    if (service === 'jiraServer') {
      const {
        providerId,
        repositoryId: projectId,
        issueId,
        accessUserId
      } = integration as TaskIntegrationJiraServer
      const dimensionName = await getDimensionName(meetingId)

      const jiraServerIssue = await dataLoader
        .get('jiraServerIssue')
        .load({providerId, teamId, userId: accessUserId, issueId})
      if (!jiraServerIssue) return NULL_FIELD
      const {issueType} = jiraServerIssue

      const existingDimensionField = await dataLoader
        .get('jiraServerDimensionFieldMap')
        .load({providerId, projectId, issueType, teamId, dimensionName})
      if (existingDimensionField) {
        return {
          name: existingDimensionField.fieldName,
          type: existingDimensionField.fieldType
        }
      }
      return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
    }
    if (service === 'azureDevOps') {
      const {instanceId, projectKey, issueKey, accessUserId} =
        integration as TaskIntegrationAzureDevOps

      const azureDevOpsWorkItem = await dataLoader.get('azureDevOpsWorkItem').load({
        teamId,
        userId: accessUserId,
        taskId,
        instanceId,
        projectId: projectKey,
        viewerId,
        workItemId: issueKey
      })

      const workItemType = azureDevOpsWorkItem?.type ?? ''
      const dimensionName = await getDimensionName(meetingId)

      const azureDevOpsDimensionFieldMapEntry = await dataLoader
        .get('azureDevOpsDimensionFieldMap')
        .load({teamId, dimensionName, instanceId, projectKey, workItemType})

      if (azureDevOpsDimensionFieldMapEntry) {
        return {
          name: azureDevOpsDimensionFieldMapEntry.fieldName,
          type: azureDevOpsDimensionFieldMapEntry.fieldType
        }
      }
      return {
        name: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
        type: 'string'
      }
    }

    if (service === 'github') {
      const {nameWithOwner} = integration
      const dimensionName = await getDimensionName(meetingId)
      const githubFieldMap = await dataLoader
        .get('githubDimensionFieldMaps')
        .load({teamId, dimensionName, nameWithOwner})
      if (githubFieldMap) {
        return {
          name: githubFieldMap.labelTemplate,
          type: 'string'
        }
      }
      return {
        name: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
        type: 'string'
      }
    }
    if (service === 'gitlab') {
      const {gid, accessUserId} = integration
      const gitlabAuth = await dataLoader
        .get('freshGitlabAuth')
        .load({teamId, userId: accessUserId})
      if (!gitlabAuth?.accessToken) return NULL_FIELD
      const {providerId} = gitlabAuth
      const provider = await dataLoader.get('integrationProviders').loadNonNull(providerId)
      const manager = new GitLabServerManager(gitlabAuth, context, info, provider.serverBaseUrl!)
      const [issueData, issueError] = await manager.getIssue({gid})
      if (issueError) {
        const userId = getUserId(authToken)
        sendToSentry(issueError, {userId, tags: {teamId, gid}})
        return NULL_FIELD
      }
      const {issue} = issueData
      if (!issue) return NULL_FIELD
      const {projectId} = issue
      const dimensionName = await getDimensionName(meetingId)
      const gitlabFieldMap = await dataLoader
        .get('gitlabDimensionFieldMaps')
        .load({teamId, dimensionName, projectId, providerId})
      if (gitlabFieldMap) {
        return {
          name: gitlabFieldMap.labelTemplate,
          type: 'string'
        }
      }
      return {
        name: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
        type: 'string'
      }
    }
    return NULL_FIELD
  },

  dimensionRef: async ({meetingId, dimensionRefIdx}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (meeting.meetingType !== 'poker') return null
    const {templateRefId} = meeting
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
    const {dimensions} = templateRef
    const {name, scaleRefId} = dimensions[dimensionRefIdx]!
    return {
      name,
      scaleRefId,
      dimensionRefIdx,
      meetingId
    }
  },

  finalScore: async ({taskId, meetingId, dimensionRefIdx}, _args, {dataLoader}) => {
    const [meeting, estimates] = await Promise.all([
      dataLoader.get('newMeetings').load(meetingId),
      dataLoader.get('meetingTaskEstimates').load({taskId, meetingId})
    ])
    if (meeting.meetingType !== 'poker') return null
    const {templateRefId} = meeting
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
    const {dimensions} = templateRef
    const dimensionRef = dimensions[dimensionRefIdx]!
    const {name: dimensionName} = dimensionRef
    const dimensionEstimate = estimates.find((estimate) => estimate.name === dimensionName)
    return dimensionEstimate?.label ?? null
  },

  hoveringUserIds: async ({id: stageId}) => {
    const redis = getRedis()
    const userIds = await redis.smembers(`pokerHover:${stageId}`)
    return userIds
  },

  hoveringUsers: async ({id: stageId}, _args, {dataLoader}) => {
    const redis = getRedis()
    const userIds = await redis.smembers(`pokerHover:${stageId}`)
    if (userIds.length === 0) return []
    return (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
  },

  scores: ({id: stageId, scores}) => {
    return scores.map((score) => ({
      ...score,
      stageId
    }))
  },

  task: async ({taskId}, _args, {dataLoader}) => {
    return dataLoader.get('tasks').load(taskId)
  }
}

export default EstimateStage
