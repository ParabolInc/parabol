import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
import unlockAllStagesForPhase from 'parabol-client/utils/unlockAllStagesForPhase'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import getRethink from '../../database/rethinkDriver'
import Reflection from '../../database/types/Reflection'
import ReflectionGroup from '../../database/types/ReflectionGroup'
import generateUID from '../../generateUID'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateReflectionInput, {CreateReflectionInputType} from '../types/CreateReflectionInput'
import CreateReflectionPayload from '../types/CreateReflectionPayload'
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
    const r = await getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}
    const {content, sortOrder, meetingId, promptId} = input
    // AUTH
    const viewerId = getUserId(authToken)
    const reflectPrompt = await dataLoader.get('reflectPrompts').load(promptId)
    if (!reflectPrompt) {
      return standardError(new Error('Category not found'), {userId: viewerId})
    }
    const {question} = reflectPrompt
    const meeting = await r.table('NewMeeting').get(meetingId).default(null).run()
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases, teamId} = meeting
    if (endedAt) {
      return {error: {message: 'Meeting already ended'}}
    }
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {tier} = team
    if (isPhaseComplete('group', phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // VALIDATION
    const normalizedContent = normalizeRawDraftJS(content)

    // RESOLUTION
    const plaintextContent = extractTextFromDraftString(normalizedContent)
    const [entities, sentimentScore] = await Promise.all([
      getReflectionEntities(plaintextContent),
      tier !== 'starter' ? getReflectionSentimentScore(question, plaintextContent) : undefined
    ])
    const reflectionGroupId = generateUID()

    const reflection = new Reflection({
      creatorId: viewerId,
      content: normalizedContent,
      plaintextContent,
      entities,
      sentimentScore,
      meetingId,
      promptId,
      reflectionGroupId,
      updatedAt: now
    })

    const smartTitle = getGroupSmartTitle([reflection])
    const reflectionGroup = new ReflectionGroup({
      id: reflectionGroupId,
      smartTitle,
      title: smartTitle,
      meetingId,
      promptId,
      sortOrder
    })

    await r({
      group: r.table('RetroReflectionGroup').insert(reflectionGroup),
      reflection: r.table('RetroReflection').insert(reflection)
    }).run()
    const groupPhase = phases.find((phase) => phase.phaseType === 'group')!
    const {stages} = groupPhase
    const [groupStage] = stages

    let unlockedStageIds
    if (!groupStage?.isNavigableByFacilitator) {
      unlockedStageIds = unlockAllStagesForPhase(phases, 'group', true)
      await r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          phases
        })
        .run()
    }
    segmentIo.track({
      event: 'Reflection Added',
      userId: viewerId,
      properties: {
        teamId,
        meetingId
      }
    })
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
