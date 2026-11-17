import getKysely from '../../../postgres/getKysely'
import type {AutogroupReflectionGroupType} from '../../../postgres/types'
import type {GQLContext} from '../../graphql'
import addReflectionToGroup from './updateReflectionLocation/addReflectionToGroup'

/**
 * Rearranges a retro's board to match a set of suggested groups.
 * Snapshots the arrangement it is replacing into NewMeeting.resetReflectionGroups so the
 * resetReflectionGroups mutation can undo it. The snapshot is taken here, at apply time, rather
 * than when the suggestions were generated, so manual drags in between are preserved by an undo.
 */
const applySuggestedGroupsToMeeting = async (
  meetingId: string,
  groups: readonly AutogroupReflectionGroupType[],
  context: GQLContext
) => {
  const pg = getKysely()
  const {dataLoader} = context
  const [reflections, reflectionGroups] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])

  const resetReflectionGroups = reflectionGroups.map((group) => {
    const {id, title} = group
    const reflectionIds = reflections
      .filter(({reflectionGroupId}) => reflectionGroupId === id)
      .map(({id}) => id)
    return {
      groupTitle: title ?? '',
      reflectionIds
    }
  })

  await Promise.all([
    ...groups.flatMap((group) => {
      const {groupTitle, reflectionIds} = group
      // Only move reflections that still exist. A card deleted since generation would otherwise
      // throw midway through this Promise.all, leaving a half-rearranged board with an undo
      // snapshot that no longer describes it.
      const reflectionsInGroup = reflections.filter(({id}) => reflectionIds.includes(id))
      const firstReflectionInGroup = reflectionsInGroup[0]
      if (!firstReflectionInGroup) {
        return []
      }
      return reflectionsInGroup.map((reflection) =>
        addReflectionToGroup(
          reflection.id,
          firstReflectionInGroup.reflectionGroupId,
          context,
          groupTitle
        )
      )
    }),
    pg
      .updateTable('NewMeeting')
      .set({resetReflectionGroups: JSON.stringify(resetReflectionGroups)})
      .where('id', '=', meetingId)
      .execute()
  ])

  return resetReflectionGroups
}

export default applySuggestedGroupsToMeeting
