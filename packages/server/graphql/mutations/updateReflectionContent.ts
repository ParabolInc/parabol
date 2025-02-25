import {generateText} from '@tiptap/core'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import {convertToTipTap} from '../../utils/convertToTipTap'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateReflectionContentPayload from '../types/UpdateReflectionContentPayload'
import updateGroupTitle from './helpers/updateGroupTitle'

export default {
  type: UpdateReflectionContentPayload,
  description: 'Update the content of a reflection',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A stringified TipTap JSONContent document containing thoughts'
    }
  },
  async resolve(
    _source: unknown,
    {reflectionId, content}: {reflectionId: string; content: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await dataLoader.get('retroReflections').load(reflectionId)
    dataLoader.get('retroReflections').clear(reflectionId)
    if (!reflection) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }
    const {creatorId, meetingId, reflectionGroupId, promptId} = reflection
    const reflectPrompt = await dataLoader.get('reflectPrompts').load(promptId)
    if (!reflectPrompt) {
      return standardError(new Error('Category not found'), {userId: viewerId})
    }
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete('group', phases)) {
      return standardError(new Error('Meeting phase already ended'), {userId: viewerId})
    }
    if (creatorId !== viewerId) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }

    // VALIDATION
    if (content && content.length > 2000) {
      return {error: {message: 'Reflection content is too long'}}
    }
    const normalizedContent = convertToTipTap(content)

    // RESOLUTION
    const plaintextContent = generateText(normalizedContent, serverTipTapExtensions)

    await pg
      .updateTable('RetroReflection')
      .set({
        content: JSON.stringify(normalizedContent),
        plaintextContent
      })
      .where('id', '=', reflectionId)
      .execute()

    const reflectionsInGroup = await dataLoader
      .get('retroReflectionsByGroupId')
      .load(reflectionGroupId)

    await updateGroupTitle({
      reflections: reflectionsInGroup,
      reflectionGroupId,
      meetingId,
      teamId,
      dataLoader
    })

    const data = {meetingId, reflectionId}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'UpdateReflectionContentPayload',
      data,
      subOptions
    )
    return data
  }
}
