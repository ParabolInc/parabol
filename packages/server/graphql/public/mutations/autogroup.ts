import getRethink from '../../../database/rethinkDriver'
import Reflection from '../../../database/types/Reflection'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import sendToSentry from '../../../utils/sendToSentry'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'
import addReflectionToGroup from '../../mutations/helpers/updateReflectionLocation/addReflectionToGroup'
import {MutationResolvers} from '../resolverTypes'

type GroupedReflection = {
  [groupTitle: string]: string[]
}

const autogroup: MutationResolvers['autogroup'] = async (
  _source,
  {meetingId}: {meetingId: string},
  context: GQLContext
) => {
  const {authToken} = context
  const viewerId = getUserId(authToken)
  const r = await getRethink()
  const meeting = await r.table('NewMeeting').get(meetingId).run()

  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  if (meeting.meetingType !== 'retrospective') {
    return standardError(new Error('Incorrect meeting type'), {userId: viewerId})
  }
  const {groupedReflectionsJSON, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  if (!groupedReflectionsJSON) {
    return standardError(new Error('groupedReflectionsJSON not found'), {
      userId: viewerId,
      tags: {meetingId}
    })
  }

  const reflections = await r
    .table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter({isActive: true})
    .orderBy('createdAt')
    .run()

  const parsedGroupedReflections: GroupedReflection[] = JSON.parse(groupedReflectionsJSON)

  const processReflectionInGroup = async (
    firstReflectionInGroup: Reflection,
    reflectionTextInGroup: string,
    group: GroupedReflection
  ) => {
    const originalReflection = reflections.find(
      ({plaintextContent}) => plaintextContent === reflectionTextInGroup
    )

    if (!originalReflection) {
      const error = new Error('Unable to match OpenAI reflection with original reflection')
      sendToSentry(error, {tags: {reflectionTextInGroup}})
      return
    }

    try {
      const smartTitle = Object.keys(group).join(', ')
      return await addReflectionToGroup(
        originalReflection.id,
        firstReflectionInGroup.reflectionGroupId,
        context,
        smartTitle
      )
    } catch (error) {
      console.error('Error adding reflection to group:', error)
    }
  }

  const processGroup = async (group: GroupedReflection) => {
    const reflectionsTextInGroup = Object.values(group).flat() as string[]
    const firstReflectionInGroup = reflections.find(
      ({plaintextContent}) => reflectionsTextInGroup[0].trim() === plaintextContent.trim()
    )

    if (!firstReflectionInGroup) {
      const error = new Error('Unable to match OpenAI reflection with original reflection')
      const problematicReflection = reflectionsTextInGroup[0]
      sendToSentry(error, {tags: {problematicReflection}})
      return
    }

    const reflectionPromises = reflectionsTextInGroup
      .slice(1)
      .map((reflectionTextInGroup) =>
        processReflectionInGroup(firstReflectionInGroup, reflectionTextInGroup, group)
      )
    await Promise.all(reflectionPromises)
  }

  const groupPromises = parsedGroupedReflections.map(processGroup)
  await Promise.all(groupPromises)

  const data = {meetingId}
  return data
}

export default autogroup
