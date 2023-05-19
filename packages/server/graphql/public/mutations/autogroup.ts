import {getUserId, isTeamMember} from '../../../utils/authorization'
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
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)
  const [meeting, reflections] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  const {meetingType, autogroupReflectionGroups, teamId} = meeting

  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  if (meetingType !== 'retrospective') {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }

  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }

  const promises = autogroupReflectionGroups.flatMap((group) => {
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

  await Promise.all(promises)
  const data = {meetingId}
  return data
}

export default autogroup
