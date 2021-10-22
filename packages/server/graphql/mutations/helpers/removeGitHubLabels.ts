import {GraphQLResolveInfo} from 'graphql'
import {RemoveLabelsMutation, RemoveLabelsMutationVariables} from '../../../types/githubTypes'
import getGitHubRequest from '../../../utils/getGitHubRequest'
import removeLabels from '../../../utils/githubQueries/removeLabels.graphql'
import {GetGitHubAuthByUserIdTeamIdResult} from '../../../postgres/queries/getGitHubAuthByUserIdTeamId'
import {GQLContext} from '../../graphql'

const removeGitHubLabels = async (
  auth: GetGitHubAuthByUserIdTeamIdResult,
  context: GQLContext,
  info: GraphQLResolveInfo,
  issueId: string,
  labelIdsToRemove: string[]
) => {
  const {accessToken} = auth
  const githubRequest = getGitHubRequest(info, context, {
    accessToken,
    headers: {Accept: 'application/vnd.github.bane-preview+json'}
  })

  const [, removeLabelsError] = await githubRequest<
    RemoveLabelsMutation,
    RemoveLabelsMutationVariables
  >(removeLabels, {
    input: {
      labelableId: issueId,
      labelIds: labelIdsToRemove
    }
  })
  console.log('removeLabelsError', removeLabelsError)
  if (removeLabelsError) return removeLabelsError

  return null
}

export default removeGitHubLabels
