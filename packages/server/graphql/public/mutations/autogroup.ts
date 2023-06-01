import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'
import addReflectionToGroup from '../../mutations/helpers/updateReflectionLocation/addReflectionToGroup'
import {MutationResolvers} from '../resolverTypes'

const autogroup: MutationResolvers['autogroup'] = async (
  _source,
  {meetingId}: {meetingId: string},
  context: GQLContext
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)
  const [meeting, reflections] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }

  const {meetingType, autogroupReflectionGroups, teamId} = meeting
  if (!autogroupReflectionGroups) {
    return standardError(new Error('No autogroup reflection groups found'), {userId: viewerId})
  }

  if (meetingType !== 'retrospective') {
    return standardError(new Error('Incorrect meeting type'), {userId: viewerId})
  }

  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  await Promise.all(
    autogroupReflectionGroups.flatMap((group) => {
      const {groupTitle, reflectionIds} = group
      const reflectionsInGroup = reflections.filter(({id}) => reflectionIds.includes(id))
      const firstReflectionInGroup = reflectionsInGroup[0]
      return reflectionsInGroup.map((reflection) =>
        addReflectionToGroup(
          reflection.id,
          firstReflectionInGroup.reflectionGroupId,
          context,
          groupTitle
        )
      )
    })
  )

  const data = {meetingId}
  return data
}

export default autogroup
