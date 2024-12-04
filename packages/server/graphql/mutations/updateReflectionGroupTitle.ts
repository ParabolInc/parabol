import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import stringSimilarity from 'string-similarity'
import getKysely from '../../postgres/getKysely'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateReflectionGroupTitlePayload from '../types/UpdateReflectionGroupTitlePayload'

type UpdateReflectionGroupTitleMutationVariables = {
  title: string
  reflectionGroupId: string
}
export default {
  type: UpdateReflectionGroupTitlePayload,
  description: 'Update the title of a reflection group',
  args: {
    reflectionGroupId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The new title for the group'
    }
  },
  async resolve(
    _source: unknown,
    {reflectionGroupId, title}: UpdateReflectionGroupTitleMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)

    if (!reflectionGroup) {
      return standardError(new Error('Reflection group not found'), {userId: viewerId})
    }
    const {meetingId, smartTitle, title: oldTitle} = reflectionGroup
    if (oldTitle === title) {
      return {error: {message: 'Group already renamed'}}
    }
    const [meeting, viewer] = await Promise.all([
      dataLoader.get('newMeetings').loadNonNull(meetingId),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete('vote', phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // VALIDATION
    const normalizedTitle = title.trim()
    if (normalizedTitle.length < 1) {
      return standardError(new Error('Reflection group title required'), {userId: viewerId})
    }

    if (normalizedTitle.length > 200) {
      return {error: {message: 'Title is too long'}}
    }

    const allGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
    const allTitles = allGroups.map((g) => g.title)
    if (allTitles.includes(normalizedTitle)) {
      return standardError(new Error('Group titles must be unique'), {userId: viewerId})
    }

    // RESOLUTION
    dataLoader.get('retroReflectionGroups').clear(reflectionGroupId)
    await pg
      .updateTable('RetroReflectionGroup')
      .set({title: normalizedTitle})
      .where('id', '=', reflectionGroupId)
      .execute()

    if (smartTitle && smartTitle === oldTitle) {
      // let's see how smart those smart titles really are. A high similarity means very helpful. Not calling this mutation means perfect!
      const similarity = stringSimilarity.compareTwoStrings(smartTitle, normalizedTitle)
      analytics.smartGroupTitleChanged(viewer, similarity, smartTitle, normalizedTitle)
    }

    const data = {meetingId, reflectionGroupId}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'UpdateReflectionGroupTitlePayload',
      data,
      subOptions
    )
    return data
  }
}
