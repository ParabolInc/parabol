import {GraphQLResolveInfo} from 'graphql'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import interpolateVotingLabelTemplate from '../../../../client/shared/interpolateVotingLabelTemplate'
import appOrigin from '../../../appOrigin'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'
import getPhase from '../../../utils/getPhase'
import makeScoreGitLabComment from '../../../utils/makeScoreGitLabComment'
import {GQLContext} from '../../graphql'
import {ITaskEstimateInput} from '../../types/TaskEstimateInput'

const pushEstimateToGitLab = async (
  taskEstimate: ITaskEstimateInput,
  context: GQLContext,
  info: GraphQLResolveInfo,
  stageId: string
) => {
  const {dimensionName, taskId, value, meetingId} = taskEstimate
  const {dataLoader} = context
  const [task, meeting] = await Promise.all([
    dataLoader.get('tasks').loadNonNull(taskId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  if (!meeting) return new Error('Meeting does not exist')
  const gitlabIntegration = task.integration as Extract<
    typeof task.integration,
    {service: 'gitlab'}
  >
  const {teamId} = task
  const {accessUserId, gid} = gitlabIntegration
  const auth = await dataLoader.get('freshGitlabAuth').load({teamId, userId: accessUserId})
  if (!auth) return new Error('User no longer has access to GitLab')
  const {providerId} = auth
  const provider = await dataLoader.get('integrationProviders').loadNonNull(providerId)
  const manager = new GitLabServerManager(auth, context, info, provider.serverBaseUrl!)
  const [issueData, issueError] = await manager.getIssue({gid})
  if (issueError) return issueError
  const {issue} = issueData
  if (!issue) return new Error(`Unable to get GitLab issue with id: ${gid}`)
  const {iid, projectId} = issue
  if (!projectId) return new Error(`Unable to get GitLab projectId for issue with id: ${gid}`)
  const fieldMap = await dataLoader
    .get('gitlabDimensionFieldMaps')
    .load({teamId, dimensionName, projectId, providerId})
  const labelTemplate = fieldMap?.labelTemplate ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT

  if (labelTemplate === SprintPokerDefaults.SERVICE_FIELD_NULL) {
    return undefined
  } else if (labelTemplate === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
    const {name: meetingName, phases} = meeting
    const estimatePhase = getPhase(phases, 'ESTIMATE')
    const {stages} = estimatePhase
    const stageIdx = stages.findIndex((stage) => stage.id === stageId)
    const discussionURL = makeAppURL(appOrigin, `meet/${meetingId}/estimate/${stageIdx + 1}`)
    const body = makeScoreGitLabComment(
      dimensionName,
      value || '<None>',
      meetingName,
      discussionURL
    )
    if (!provider?.serverBaseUrl) return new Error('Invalid GitLab provider')
    const [, commentError] = await manager.createNote({body, noteableId: gid})
    if (commentError) return commentError
  } else if (
    labelTemplate === SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE ||
    labelTemplate === SprintPokerDefaults.GITLAB_FIELD_WEIGHT
  ) {
    const [projectsData, projectsError] = await manager.getProjects({
      ids: [`gid://gitlab/Project/${projectId}`]
    })
    if (projectsError) return projectsError
    const project = projectsData?.projects?.edges?.[0]?.node
    if (!project) return new Error(`Unable to get GitLab project with id: ${projectId}`)
    const {fullPath} = project
    if (!provider?.serverBaseUrl) return new Error('Invalid GitLab provider')

    if (labelTemplate === SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE) {
      const [, updateError] = await manager.updateIssue({
        iid,
        projectPath: fullPath,
        timeEstimate: value
      })
      if (updateError) return updateError
    } else {
      const weight = parseInt(value)
      if (isNaN(weight) || weight < 0 || `${weight}` !== value.trim())
        return new Error('Weight must be a whole positive number')
      const [, updateError] = await manager.updateIssue({iid, projectPath: fullPath, weight})
      if (updateError) return updateError
    }
  } else {
    const [projectsData, projectsError] = await manager.getProjects({
      ids: [`gid://gitlab/Project/${projectId}`]
    })
    if (projectsError) return projectsError
    const project = projectsData?.projects?.edges?.[0]?.node
    if (!project) return new Error(`Unable to get GitLab project with id: ${projectId}`)
    const {fullPath} = project

    const title = interpolateVotingLabelTemplate(labelTemplate, value)

    const [labelsData, labelsError] = await manager.getLabels({
      fullPath,
      title
    })
    if (labelsError) return labelsError

    let labelId = labelsData?.project?.labels?.nodes?.[0]?.id
    if (!labelId) {
      let color: string = PALETTE.GRAPE_500
      const {templateRefId} = meeting
      const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId!)
      const {dimensions} = templateRef
      const dimensionRef = dimensions.find((dimension) => dimension.name === dimensionName)
      if (!dimensionRef) return new Error('Dimension not found')
      const {scaleRefId} = dimensionRef
      const scaleRef = await dataLoader.get('templateScaleRefs').loadNonNull(scaleRefId)
      const {values} = scaleRef
      const matchingValue = values.find((scaleValue) => scaleValue.label === value)
      if (matchingValue) {
        color = matchingValue.color
      }

      const [labelData, createError] = await manager.createLabel({
        color,
        projectPath: fullPath,
        title,
        description: 'Generated by Parabol'
      })
      if (createError) return createError
      labelId = labelData?.labelCreate?.label?.id
    }
    if (!labelId) return new Error('Could not create label')

    const removeLabelIds: string[] = []
    const latestTaskEstimates = await dataLoader.get('latestTaskEstimates').load(taskId)
    const dimensionTaskEstimate = latestTaskEstimates.find(
      (estimate) => estimate.name === dimensionName
    )
    if (dimensionTaskEstimate) {
      const oldLabelId = dimensionTaskEstimate.gitlabLabelId
      if (oldLabelId) {
        removeLabelIds.push(oldLabelId)
      }
    }

    const [, updateError] = await manager.updateIssue({
      iid,
      projectPath: fullPath,
      addLabelIds: [labelId],
      removeLabelIds
    })
    if (updateError) return updateError
    return labelId
  }

  return undefined
}

export default pushEstimateToGitLab
