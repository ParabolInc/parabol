import getRethink from '../../../database/rethinkDriver'
import Reflection from '../../../database/types/Reflection'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import sendToSentry from '../../../utils/sendToSentry'

const generateGroups = async (reflections: Reflection[]) => {
  const meetingId = reflections[0]!.meetingId
  const groupReflectionsInput = reflections.map((reflection) => reflection.plaintextContent)
  const manager = new OpenAIServerManager()
  const groupedReflectionsJSON = await manager.groupReflections(groupReflectionsInput)
  console.log('🚀 ~ groupedReflectionsJSON:', groupedReflectionsJSON)
  if (!groupedReflectionsJSON) {
    const error = new Error('Error using OpenAI to group reflections')
    const joinedInput = groupReflectionsInput.join(', ')
    sendToSentry(error, {tags: {joinedInput}})
    return
  }
  const parsedGroupedReflections = JSON.parse(groupedReflectionsJSON)
  console.log('🚀 ~ parsedGroupedReflections:', parsedGroupedReflections)
  const r = await getRethink()
  const test = await r.table('NewMeeting').get(meetingId).update({groupedReflectionsJSON}).run()
  console.log('🚀 ~ test:', test)
}

export default generateGroups
