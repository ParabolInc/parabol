import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import type {GQLContext} from '../../graphql'
import {getReactable} from '../mutations/addReactjiToReactable'
import type {MutationAddReactjiToReactableArgs} from '../resolverTypes'

export const isReactableInMeeting = rule(`isReactableInMeeting`, {cache: 'strict'})(
  async (
    _source,
    {reactableId, reactableType, meetingId}: MutationAddReactjiToReactableArgs,
    {dataLoader}: GQLContext
  ) => {
    const reactableDBId =
      reactableType === 'RESPONSE' ? TeamPromptResponseId.split(reactableId) : reactableId
    const reactable = await getReactable(reactableDBId, reactableType, dataLoader)
    const reactableMeetingId = !reactable
      ? undefined
      : 'discussionId' in reactable
        ? (await dataLoader.get('discussions').load(reactable.discussionId))?.meetingId
        : reactable.meetingId
    if (reactableMeetingId !== meetingId)
      return new GraphQLError('Item does not exist', {extensions: {code: 'NOT_FOUND'}})
    return true
  }
)
