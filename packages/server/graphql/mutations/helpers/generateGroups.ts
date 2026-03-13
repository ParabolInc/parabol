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
  if (!(await canAccessAI(team, dataLoader))) return
  const manager = new OpenAIServerManager()
  const promptIds = [...new Set(reflections.map((r) => r.promptId))]
  const prompts = await Promise.all(
    promptIds.map((id) => dataLoader.get('reflectPrompts').loadNonNull(id))
  )
  const promptMap = new Map(prompts.map((p) => [p.id, p.question]))
  const input = reflections.map((r) => ({
    id: r.id,
    text: r.plaintextContent,
    prompt: promptMap.get(r.promptId) ?? ''
  }))
  const result = await manager.groupReflectionsStructured(input)
  if (!result) {
    Logger.warn('OpenAI was unable to group the reflections')
    await getKysely()
      .updateTable('NewMeeting')
      .set({autogroupReflectionGroups: JSON.stringify([])})
      .where('id', '=', meetingId)
      .execute()
    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'GenerateGroupsSuccess', data, subOptions)
    return
  }
  const autogroupReflectionGroups: AutogroupReflectionGroupType[] = result.groups.map((g) => ({
    groupTitle: g.title,
    reflectionIds: g.reflectionIds
  }))

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
  return autogroupReflectionGroups
}

export default generateGroups
