import {generateText} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {convertToTipTap} from '../../../utils/convertToTipTap'
import publish from '../../../utils/publish'
import {embedRetroReflection} from '../../mutations/helpers/embedRetroReflection'
import updateGroupTitle from '../../mutations/helpers/updateGroupTitle'
import type {MutationResolvers} from '../resolverTypes'

const updateReflectionContent: MutationResolvers['updateReflectionContent'] = async (
  _source,
  {reflectionId, content},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)
  dataLoader.get('retroReflections').clear(reflectionId)
  if (!reflection) throw new GraphQLError('Reflection not found', {extensions: {code: 'NOT_FOUND'}})
  const {creatorId, meetingId, reflectionGroupId, promptId} = reflection
  const reflectPrompt = await dataLoader.get('templatePrompts').load(promptId)
  if (!reflectPrompt)
    throw new GraphQLError('Category not found', {extensions: {code: 'NOT_FOUND'}})
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {endedAt, phases, teamId} = meeting
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (isPhaseComplete('group', phases)) {
    throw new GraphQLError('Meeting phase already ended', {extensions: {code: 'CONFLICT'}})
  }
  if (creatorId !== viewerId) {
    throw new GraphQLError('Reflection not found', {extensions: {code: 'NOT_FOUND'}})
  }

  // VALIDATION
  if (content && content.length > 2000)
    throw new GraphQLError('Reflection content is too long', {extensions: {code: 'BAD_USER_INPUT'}})
  const normalizedContent = convertToTipTap(content)

  // RESOLUTION
  const plaintextContent = generateText(normalizedContent, serverTipTapExtensions)
  await pg
    .updateTable('RetroReflection')
    .set({content: JSON.stringify(normalizedContent), plaintextContent})
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
  embedRetroReflection(reflectionId, meetingId, teamId, new Date()).catch(console.error)

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

export default updateReflectionContent
