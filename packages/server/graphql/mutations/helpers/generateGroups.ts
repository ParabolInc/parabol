import getRethink from '../../../database/rethinkDriver'
import Reflection from '../../../database/types/Reflection'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import {AutogroupReflectionGroupType} from '../../../database/types/MeetingRetrospective'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import publish from '../../../utils/publish'
import {analytics} from '../../../utils/analytics/analytics'

const generateGroups = async (
  reflections: Reflection[],
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const {meetingId} = reflections[0]!
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const organization = await dataLoader.get('organizations').load(team.orgId)
  const {featureFlags} = organization
  const hasSuggestGroupsFlag = featureFlags?.includes('suggestGroups')
  if (!hasSuggestGroupsFlag) return
  const groupReflectionsInput = reflections.map((reflection) => reflection.plaintextContent)
  const manager = new OpenAIServerManager()

  const themes = await manager.generateThemes(groupReflectionsInput)
  if (!themes) {
    console.warn('ChatGPT was unable to generate themes')
    return
  }
  const groupedReflections = await manager.groupReflections(groupReflectionsInput, themes)

  if (!groupedReflections) {
    console.warn('ChatGPT was unable to group the reflections')
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

  const r = await getRethink()
  const meetingRes = await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {autogroupReflectionGroups},
      {returnChanges: true}
    )('changes')(0)('new_val')
    .run()
  const {facilitatorUserId} = meetingRes
  const data = {meetingId}
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  analytics.suggestedGroupsGenerated(facilitatorUserId, meetingId, teamId)
  publish(SubscriptionChannel.MEETING, meetingId, 'GenerateGroupsSuccess', data, subOptions)
  return autogroupReflectionGroups
}

export default generateGroups
