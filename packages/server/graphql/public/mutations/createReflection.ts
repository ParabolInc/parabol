import {generateText} from '@tiptap/core'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getSimpleGroupTitle} from 'parabol-client/utils/getSimpleGroupTitle'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import unlockAllStagesForPhase from 'parabol-client/utils/unlockAllStagesForPhase'
import ReflectionGroup from '../../../database/types/ReflectionGroup'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {convertToTipTap} from '../../../utils/convertToTipTap'
import publish from '../../../utils/publish'
import updateGroupTitle from '../../mutations/helpers/updateGroupTitle'
import type {MutationResolvers} from '../resolverTypes'

const createReflection: MutationResolvers['createReflection'] = async (
  _source,
  {input},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const {content, sortOrder, meetingId, promptId} = input
  // AUTH
  const viewerId = getUserId(authToken)
  const [reflectPrompt, meeting, viewer] = await Promise.all([
    dataLoader.get('reflectPrompts').load(promptId),
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!reflectPrompt) {
    return {error: {message: 'Category not found'}}
  }
  if (!meeting) {
    return {error: {message: 'Meeting not found'}}
  }
  const {endedAt, phases, teamId} = meeting
  if (endedAt) {
    return {error: {message: 'Meeting already ended'}}
  }
  if (isPhaseComplete('group', phases)) {
    return {error: {message: 'Meeting phase already completed'}}
  }

  // VALIDATION
  if (content && content.length > 2000) {
    return {error: {message: 'Reflection content is too long'}}
  }

  const normalizedContent = convertToTipTap(content)

  // RESOLUTION
  const plaintextContent = generateText(normalizedContent, serverTipTapExtensions)

  const reflectionGroupId = generateUID()

  const reflection = {
    id: generateUID(),
    creatorId: viewerId,
    content: JSON.stringify(normalizedContent),
    plaintextContent,
    meetingId,
    promptId,
    reflectionGroupId
  }

  const smartTitle = getSimpleGroupTitle([reflection])
  const reflectionGroup = new ReflectionGroup({
    id: reflectionGroupId,
    smartTitle,
    title: smartTitle,
    meetingId,
    promptId,
    sortOrder
  })

  // Upgrade the simple title to an AI-generated one. Don't await to keep things snappy
  updateGroupTitle({
    reflections: [reflection],
    reflectionGroupId,
    meetingId,
    teamId,
    dataLoader
  }).catch((e) => {
    console.error('Error generating AI title for new reflection:', e)
  })

  await pg
    .with('Group', (qc) => qc.insertInto('RetroReflectionGroup').values(reflectionGroup))
    .insertInto('RetroReflection')
    .values(reflection)
    .execute()

  const groupPhase = phases.find((phase) => phase.phaseType === 'group')!
  const {stages} = groupPhase
  const [groupStage] = stages

  let unlockedStageIds
  if (!groupStage?.isNavigableByFacilitator) {
    unlockedStageIds = unlockAllStagesForPhase(phases, 'group', true)
    await pg
      .updateTable('NewMeeting')
      .set({phases: JSON.stringify(phases)})
      .where('id', '=', meetingId)
      .execute()
    dataLoader.clearAll('newMeetings')
  }
  analytics.reflectionAdded(viewer, teamId, meetingId)

  const data = {
    meetingId,
    reflectionId: reflection.id,
    reflectionGroupId,
    unlockedStageIds
  }
  publish(SubscriptionChannel.MEETING, meetingId, 'CreateReflectionPayload', data, subOptions)

  return data
}

export default createReflection
