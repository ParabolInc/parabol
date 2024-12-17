import {generateText} from '@tiptap/core'
import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
import unlockAllStagesForPhase from 'parabol-client/utils/unlockAllStagesForPhase'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import ReflectionGroup from '../../database/types/ReflectionGroup'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {toGoogleAnalyzedEntity} from '../../postgres/helpers/toGoogleAnalyzedEntity'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId} from '../../utils/authorization'
import {convertToTipTap} from '../../utils/convertToTipTap'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateReflectionInput, {CreateReflectionInputType} from '../types/CreateReflectionInput'
import CreateReflectionPayload from '../types/CreateReflectionPayload'
import {getFeatureTier} from '../types/helpers/getFeatureTier'
import getReflectionEntities from './helpers/getReflectionEntities'
import getReflectionSentimentScore from './helpers/getReflectionSentimentScore'

export default {
  type: CreateReflectionPayload,
  description: 'Create a new reflection',
  args: {
    input: {
      type: new GraphQLNonNull(CreateReflectionInput)
    }
  },
  async resolve(
    _source: unknown,
    {input}: {input: CreateReflectionInputType},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
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
      return standardError(new Error('Category not found'), {userId: viewerId})
    }
    const {question} = reflectPrompt
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases, teamId} = meeting
    if (endedAt) {
      return {error: {message: 'Meeting already ended'}}
    }
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    if (isPhaseComplete('group', phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // VALIDATION
    const normalizedContent = convertToTipTap(content)
    if (normalizedContent.length > 2000) {
      return {error: {message: 'Reflection content is too long'}}
    }

    // RESOLUTION
    const plaintextContent = generateText(normalizedContent, serverTipTapExtensions)

    const [entities, sentimentScore] = await Promise.all([
      getReflectionEntities(plaintextContent),
      getFeatureTier(team) !== 'starter'
        ? getReflectionSentimentScore(question, plaintextContent)
        : undefined
    ])
    const reflectionGroupId = generateUID()

    const reflection = {
      id: generateUID(),
      creatorId: viewerId,
      content: JSON.stringify(normalizedContent),
      plaintextContent,
      entities,
      sentimentScore,
      meetingId,
      promptId,
      reflectionGroupId
    }

    const smartTitle = getGroupSmartTitle([reflection])
    const reflectionGroup = new ReflectionGroup({
      id: reflectionGroupId,
      smartTitle,
      title: smartTitle,
      meetingId,
      promptId,
      sortOrder
    })

    await pg
      .with('Group', (qc) => qc.insertInto('RetroReflectionGroup').values(reflectionGroup))
      .insertInto('RetroReflection')
      .values({...reflection, entities: toGoogleAnalyzedEntity(entities)})
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
}
