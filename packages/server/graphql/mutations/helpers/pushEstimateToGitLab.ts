import {GraphQLResolveInfo} from 'graphql'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
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
    dataLoader.get('tasks').load(taskId),
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
  const {projectId} = issue
  const fieldMap = await dataLoader
    .get('gitlabDimensionFieldMaps')
    .load({teamId, dimensionName, projectId, providerId})
  const labelTemplate = fieldMap?.labelTemplate ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT
  if (labelTemplate === SprintPokerDefaults.SERVICE_FIELD_NULL) return undefined
  if (labelTemplate === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
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
    const manager = new GitLabServerManager(auth, context, info, provider.serverBaseUrl)
    const [, commentError] = await manager.createNote({body, noteableId: gid})
    if (commentError) return commentError
  }
  return null
}

export default pushEstimateToGitLab
