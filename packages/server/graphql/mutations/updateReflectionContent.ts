import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import UpdateReflectionContentPayload from '../types/UpdateReflectionContentPayload'
import normalizeRawDraftJS from '../../../client/validation/normalizeRawDraftJS'
import publish from '../../utils/publish'
import isPhaseComplete from '../../../client/utils/meetings/isPhaseComplete'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import Reflection from '../../database/types/Reflection'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import getReflectionEntities from './helpers/getReflectionEntities'
import {GQLContext} from '../graphql'
import getGroupSmartTitle from 'parabol-client/utils/autogroup/getGroupSmartTitle'
import updateSmartGroupTitle from './helpers/updateReflectionLocation/updateSmartGroupTitle'
import stringSimilarity from 'string-similarity'

export default {
  type: UpdateReflectionContentPayload,
  description: 'Update the content of a reflection',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A stringified draft-js document containing thoughts'
    }
  },
  async resolve(
    _source,
    {reflectionId, content},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await r
      .table('RetroReflection')
      .get(reflectionId)
      .run()
    if (!reflection) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }
    const {creatorId, meetingId, reflectionGroupId} = reflection
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete(NewMeetingPhaseTypeEnum.group, phases)) {
      return standardError(new Error('Meeting phase already ended'), {userId: viewerId})
    }
    if (creatorId !== viewerId) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }

    // VALIDATION
    const normalizedContent = normalizeRawDraftJS(content)

    // RESOLUTION
    const plaintextContent = extractTextFromDraftString(normalizedContent)
    const isVeryDifferent =
      stringSimilarity.compareTwoStrings(plaintextContent, reflection.plaintextContent) < 0.9
    const entities = isVeryDifferent
      ? await getReflectionEntities(plaintextContent)
      : reflection.entities
    await r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        content: normalizedContent,
        entities,
        plaintextContent,
        updatedAt: now
      })
      .run()

    const reflectionsInGroup = (await r
      .table('RetroReflection')
      .getAll(reflectionGroupId, {index: 'reflectionGroupId'})
      .filter({isActive: true})
      .run()) as Reflection[]

    const newTitle = getGroupSmartTitle(reflectionsInGroup)
    await updateSmartGroupTitle(reflectionGroupId, newTitle)

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
