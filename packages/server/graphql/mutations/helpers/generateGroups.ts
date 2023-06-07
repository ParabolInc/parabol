import getRethink from '../../../database/rethinkDriver'
import Reflection from '../../../database/types/Reflection'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import {AutogroupReflectionGroupType} from '../../../database/types/MeetingRetrospective'

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
  const groupedReflectionsJSON = await manager.groupReflections(groupReflectionsInput)
  if (!groupedReflectionsJSON) {
    console.warn('ChatGPT was unable to group the reflections')
    return
  }
  const parsedGroupedReflections = JSON.parse(groupedReflectionsJSON)
  const autogroupReflectionGroups: AutogroupReflectionGroupType[] = []

  for (const group of parsedGroupedReflections) {
    const groupTitle = Object.keys(group)[0]
    if (!groupTitle) continue
    const reflectionTexts = group[groupTitle]
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
  await r.table('NewMeeting').get(meetingId).update({autogroupReflectionGroups}).run()
}

export default generateGroups
