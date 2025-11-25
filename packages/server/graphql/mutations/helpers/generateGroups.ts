import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import type {AutogroupReflectionGroupType, RetroReflection} from '../../../postgres/types'
import {analytics} from '../../../utils/analytics/analytics'
import {Logger} from '../../../utils/Logger'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import canAccessAI from './canAccessAI'

const generateGroups = async (reflections: RetroReflection[], teamId: string) => {
  if (reflections.length === 0) return
  // create a brand new dataloader to share with the other workers because
  // the existing dataloader was shared before the titles were updated
  const dataLoader = getNewDataLoader(`generateGroups`)
  const operationId = dataLoader.share()
  dataLoader.dispose()
  const subOptions = {operationId}
  const {meetingId} = reflections[0]!
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (!(await canAccessAI(team, dataLoader))) {
    dataLoader.dispose()
    return
  }
  const groupReflectionsInput = reflections.map((reflection) => reflection.plaintextContent)
  const manager = new OpenAIServerManager()

  const themes = await manager.generateThemes(groupReflectionsInput)
  if (!themes) {
    dataLoader.dispose()
    Logger.warn('ChatGPT was unable to generate themes')
    return
  }
  const groupedReflections = await manager.groupReflections(groupReflectionsInput, themes)

  if (!groupedReflections) {
    dataLoader.dispose()
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
    .set({
      autogroupReflectionGroups: JSON.stringify(autogroupReflectionGroups)
    })
    .where('id', '=', meetingId)
    .execute()
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {facilitatorUserId} = meeting
  const data = {meetingId}
  const user = await dataLoader.get('users').loadNonNull(facilitatorUserId!)
  analytics.suggestedGroupsGenerated(user, meetingId, teamId)
  publish(SubscriptionChannel.MEETING, meetingId, 'GenerateGroupsSuccess', data, subOptions)
  dataLoader.dispose()
  return autogroupReflectionGroups
}

export default generateGroups
