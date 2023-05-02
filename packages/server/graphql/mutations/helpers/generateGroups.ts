import getRethink from '../../../database/rethinkDriver'
import Reflection from '../../../database/types/Reflection'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'

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
  const r = await getRethink()
  const groupReflectionsInput = reflections.map((reflection) => reflection.plaintextContent)
  const manager = new OpenAIServerManager()
  const groupedReflectionsJSON = await manager.groupReflections(groupReflectionsInput)
  if (!groupedReflectionsJSON) {
    console.warn('ChatGPT was unable to group the reflections')
    return
  }
  await r.table('NewMeeting').get(meetingId).update({groupedReflectionsJSON}).run()
}

export default generateGroups
