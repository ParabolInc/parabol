import {GraphQLResolveInfo} from 'graphql'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import LinearServerManager from '../../../integrations/linear/LinearServerManager'
import makeScoreLinearComment from '../../../integrations/linear/makeScoreLinearComment'
import getPhase from '../../../utils/getPhase'
import {GQLContext} from '../../graphql'
import {ITaskEstimateInput} from '../../types/TaskEstimateInput'

const pushEstimateToLinear = async (
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
  const linearIntegration = task.integration as Extract<
    typeof task.integration,
    {service: 'linear'}
  >
  const {teamId} = task
  const {accessUserId, issueId, repoId} = linearIntegration

  const auth = await dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'linear', teamId, userId: accessUserId})
  if (!auth?.accessToken) return new Error('User no longer has access to Linear')

  const fieldMap = await dataLoader
    .get('linearDimensionFieldMaps')
    .load({teamId, dimensionName, repoId})
  const fieldMapSelection = fieldMap?.labelTemplate ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT

  const manager = new LinearServerManager(auth, context, info)

  if (fieldMapSelection === SprintPokerDefaults.SERVICE_FIELD_NULL) {
    return undefined
  } else if (fieldMapSelection === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
    const {name: meetingName, phases} = meeting
    const estimatePhase = getPhase(phases, 'ESTIMATE')
    const {stages} = estimatePhase
    const stageIdx = stages.findIndex((stage) => stage.id === stageId)
    const discussionURL = makeAppURL(appOrigin, `meet/${meetingId}/estimate/${stageIdx + 1}`)
    const body = makeScoreLinearComment(
      dimensionName,
      value || '<None>',
      meetingName,
      discussionURL
    )
    const [, commentError] = await manager.createComment({issueId, body})
    if (commentError) return commentError
  } else if (
    fieldMapSelection === SprintPokerDefaults.LINEAR_FIELD_ESTIMATE ||
    fieldMapSelection === SprintPokerDefaults.LINEAR_FIELD_PRIORITY
  ) {
    const valueMaybeInt = parseInt(value)
    const paramName =
      fieldMapSelection === SprintPokerDefaults.LINEAR_FIELD_ESTIMATE ? 'estimate' : 'priority'

    if (isNaN(valueMaybeInt) || valueMaybeInt < 0 || `${valueMaybeInt}` !== value.trim())
      return new Error(`Value for ${paramName} must be a whole positive number`)
    const variables = {id: issueId, [paramName]: valueMaybeInt}
    const [, updateError] = await manager.updateIssue(variables)
    if (updateError) return updateError
  }

  return undefined
}

export default pushEstimateToLinear
