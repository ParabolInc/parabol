import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {AutogroupReflectionGroupType, RetroReflection} from '../../../postgres/types'
import {Logger} from '../../../utils/Logger'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import publish from '../../../utils/publish'
import {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'

const generateGroups = async (
  reflections: RetroReflection[],
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  if (reflections.length === 0) return
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const {meetingId} = reflections[0]!
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (!(await canAccessAI(team, dataLoader))) return
  const groupReflectionsInput = reflections.map((reflection) => reflection.plaintextContent)
  const manager = new OpenAIServerManager()

  const themes = await manager.generateThemes(groupReflectionsInput)
  if (!themes) {
    Logger.warn('ChatGPT was unable to generate themes')
    return
  }
  const groupedReflections = await manager.groupReflections(groupReflectionsInput, themes)

  if (!groupedReflections) {
    Logger.warn('ChatGPT was unable to group the reflections')
    return
  }
  const autogroupReflectionGroups: AutogroupReflectionGroupType[] = []

  for (const [groupTitle, reflectionTexts] of Object.entries(groupedReflections)) {
    const reflectionIds: string[] = []

    for (const reflectionText of reflectionTexts) {
      const reflection = reflections.find(
        (r) => r.plaintextContent.trim() === reflectionText.trim()
      )
      if (reflection) {
        reflectionIds.push(reflection.id)
      }
    }
    autogroupReflectionGroups.push({
      groupTitle,
      reflectionIds
    })
  }

  await getKysely()
    .updateTable('NewMeeting')
    .set({autogroupReflectionGroups: JSON.stringify(autogroupReflectionGroups)})
    .where('id', '=', meetingId)
    .execute()
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {facilitatorUserId} = meeting
  const data = {meetingId}
  const user = await dataLoader.get('users').loadNonNull(facilitatorUserId!)
  analytics.suggestedGroupsGenerated(user, meetingId, teamId)
  publish(SubscriptionChannel.MEETING, meetingId, 'GenerateGroupsSuccess', data, subOptions)
  return autogroupReflectionGroups
}

export default generateGroups
