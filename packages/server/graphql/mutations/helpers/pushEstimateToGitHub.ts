import {GraphQLResolveInfo} from 'graphql'
import GitHubRepoId from 'parabol-client/shared/gqlIds/GitHubRepoId'
import interpolateGitHubLabelTemplate from 'parabol-client/shared/interpolateGitHubLabelTemplate'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {isNotNull} from 'parabol-client/utils/predicates'
import appOrigin from '../../../appOrigin'
import MeetingPoker from '../../../database/types/MeetingPoker'
import {
  AddCommentMutation,
  AddCommentMutationVariables,
  AddLabelMutation,
  AddLabelMutationVariables,
  CreateLabelMutation,
  CreateLabelMutationVariables,
  GetIssueIdQuery,
  GetIssueIdQueryVariables,
  GetRepoLabelsQuery,
  GetRepoLabelsQueryVariables,
  RemoveLabelsMutation,
  RemoveLabelsMutationVariables
} from '../../../types/githubTypes'
import getGitHubRequest from '../../../utils/getGitHubRequest'
import getPhase from '../../../utils/getPhase'
import addComment from '../../../utils/githubQueries/addComment.graphql'
import addLabel from '../../../utils/githubQueries/addLabel.graphql'
import createLabel from '../../../utils/githubQueries/createLabel.graphql'
import getIssueId from '../../../utils/githubQueries/getIssueId.graphql'
import getRepoLabels from '../../../utils/githubQueries/getRepoLabels.graphql'
import removeLabels from '../../../utils/githubQueries/removeLabels.graphql'
import makeScoreGitHubComment from '../../../utils/makeScoreGitHubComment'
import {GQLContext} from '../../graphql'
import {ITaskEstimateInput} from '../../types/TaskEstimateInput'

const pushEstimateToGitHub = async (
  taskEstimate: ITaskEstimateInput,
  context: GQLContext,
  info: GraphQLResolveInfo,
  stageId: string | undefined
) => {
  const {dimensionName, taskId, value, meetingId} = taskEstimate
  const {dataLoader} = context
  const [task, meeting] = await Promise.all([
    dataLoader.get('tasks').load(taskId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  const githubIntegration = task.integration as Extract<
    typeof task.integration,
    {service: 'github'}
  >
  const {teamId} = task
  const {accessUserId, issueNumber, nameWithOwner} = githubIntegration
  const [auth, fieldMap] = await Promise.all([
    dataLoader.get('githubAuth').load({teamId, userId: accessUserId}),
    dataLoader.get('githubDimensionFieldMaps').load({dimensionName, nameWithOwner, teamId})
  ])
  if (!auth) return new Error('User no longer has access to GitHub')
  const labelTemplate = fieldMap?.labelTemplate ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT
  if (labelTemplate === SprintPokerDefaults.SERVICE_FIELD_NULL) return undefined
  const {repoName, repoOwner} = GitHubRepoId.split(nameWithOwner)

  // Set up githubRequest
  const githubLabelName = interpolateGitHubLabelTemplate(labelTemplate, value)
  const {accessToken} = auth
  const githubRequest = getGitHubRequest(info, context, {
    accessToken,
    headers: {Accept: 'application/vnd.github.bane-preview+json'}
  })

  if (labelTemplate === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
    if (!stageId || !meeting)
      return new Error('Cannot add GitHub comment for non-meeting estimates')

    // get the issue ID
    const [issueRes, issueResError] = await githubRequest<
      GetIssueIdQuery,
      GetIssueIdQueryVariables
    >(getIssueId, {
      name: repoName,
      owner: repoOwner,
      number: issueNumber
    })
    if (issueResError) return issueResError
    const {repository} = issueRes
    if (!repository) return new Error('Repository not found on GitHub')

    const {issue} = repository
    if (!issue) return new Error('Issue not found on GitHub')

    const {id: issueId} = issue
    const {name: meetingName, phases} = meeting
    const estimatePhase = getPhase(phases, 'ESTIMATE')
    const {stages} = estimatePhase
    const stageIdx = stages.findIndex((stage) => stage.id === stageId)
    const discussionURL = makeAppURL(appOrigin, `meet/${meetingId}/estimate/${stageIdx + 1}`)
    const body = makeScoreGitHubComment(
      dimensionName,
      value || '<None>',
      meetingName,
      discussionURL
    )

    const [, commentError] = await githubRequest<AddCommentMutation, AddCommentMutationVariables>(
      addComment,
      {
        input: {
          body,
          subjectId: issueId
        }
      }
    )
    if (commentError) return commentError
    return undefined
  }

  const [repoLabelsRes, repoLabelsError] = await githubRequest<
    GetRepoLabelsQuery,
    GetRepoLabelsQueryVariables
  >(getRepoLabels, {
    name: repoName,
    owner: repoOwner,
    issueNumber,
    first: 100
  })
  if (repoLabelsError) return repoLabelsError

  const {repository} = repoLabelsRes
  if (!repository) return new Error('Repository not found on GitHub')

  const {id: repositoryId, labels, issue} = repository
  if (!labels) return new Error('Labels for repository not found')
  if (!issue) return new Error(`Issue #${issueNumber} not found`)

  const {id: issueId, labels: issueLabels} = issue
  const {nodes} = labels
  if (!nodes) return new Error('Label nodes not found')
  if (!issueLabels) return new Error('Issue labels not found')

  const {nodes: nullableIssueLabelNodes} = issueLabels
  if (!nullableIssueLabelNodes) return new Error('Issue label nodes not found')

  const issueLabelNodes = nullableIssueLabelNodes.filter(isNotNull)
  const labelNodes = nodes.filter(isNotNull)
  const matchingLabel = labelNodes.find((node) => node.name === githubLabelName)
  const DESCRIPTION_IDENTIFIER = 'Generated by Parabol'
  let labelToAddId = matchingLabel?.id ?? ''
  if (!matchingLabel) {
    let color = PALETTE.GRAPE_500.slice(1)
    if (meeting) {
      const {templateRefId} = meeting as MeetingPoker
      const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
      const {dimensions} = templateRef
      const dimensionRef = dimensions.find((dimension) => dimension.name === dimensionName)
      if (!dimensionRef) return new Error('Dimension not found')
      const {scaleRefId} = dimensionRef
      const scaleRef = await dataLoader.get('templateScaleRefs').loadNonNull(scaleRefId)
      const {values} = scaleRef
      const matchingValue = values.find((scaleValue) => scaleValue.label === value)
      if (matchingValue) {
        // remove # prefix
        color = matchingValue.color.slice(1)
      }
    } else {
      // TODO: https://github.com/ParabolInc/parabol/issues/5426
    }

    // create a new label
    const [createLabelRes, createLabelError] = await githubRequest<
      CreateLabelMutation,
      CreateLabelMutationVariables
    >(createLabel, {
      input: {
        repositoryId,
        color,
        name: githubLabelName,
        description: DESCRIPTION_IDENTIFIER
      }
    })
    if (createLabelError) return createLabelError

    const {createLabel: createLabelRes2} = createLabelRes
    if (!createLabelRes2) return new Error('Could not create label')

    const {label} = createLabelRes2
    if (!label) return new Error('Could not get created label')

    labelToAddId = label.id
  }
  // DELETE OLD LABELS
  const latestTaskEstimates = await dataLoader.get('latestTaskEstimates').load(taskId)
  const dimensionTaskEstimate = latestTaskEstimates.find(
    (estimate) => estimate.name === dimensionName
  )
  if (dimensionTaskEstimate) {
    const {githubLabelName} = dimensionTaskEstimate
    const labelIdsToRemove = issueLabelNodes
      .filter((node) => node.name === githubLabelName)
      .map((node) => node.id)
    if (labelIdsToRemove.length > 0) {
      const [, removeLabelsError] = await githubRequest<
        RemoveLabelsMutation,
        RemoveLabelsMutationVariables
      >(removeLabels, {
        input: {
          labelableId: issueId,
          labelIds: labelIdsToRemove
        }
      })
      if (removeLabelsError) return removeLabelsError
    }
  }

  // ADD NEW LABEL
  const [, addLabelError] = await githubRequest<AddLabelMutation, AddLabelMutationVariables>(
    addLabel,
    {
      input: {
        labelableId: issueId,
        labelIds: [labelToAddId]
      }
    }
  )
  if (addLabelError) return addLabelError
  return githubLabelName
}

export default pushEstimateToGitHub
