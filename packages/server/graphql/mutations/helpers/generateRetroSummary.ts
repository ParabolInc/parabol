import yaml from 'js-yaml'
import getKysely from '../../../postgres/getKysely'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import canAccessAISummary from './canAccessAISummary'
import {transformRetroToAIFormat} from './transformRetroToAIFormat'

export const generateRetroSummary = async (
  meetingId: string,
  dataLoader: DataLoaderWorker,
  prompt?: string
): Promise<string | null> => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId, facilitatorUserId} = meeting

  // Check access first
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const isAISummaryAccessible = await canAccessAISummary(
    team,
    facilitatorUserId as string, // is being removed in another PR
    'retrospective',
    dataLoader
  )
  if (!isAISummaryAccessible) return null

  const transformedMeeting = await transformRetroToAIFormat(meeting, dataLoader)
  if (!transformedMeeting || transformedMeeting.length === 0) {
    return null
  }

  const yamlData = yaml.dump(transformedMeeting, {
    noCompatMode: true
  })

  const manager = new OpenAIServerManager()
  const newSummary = await manager.generateSummary(yamlData, prompt)
  if (!newSummary) return null

  const pg = getKysely()
  await pg
    .updateTable('NewMeeting')
    .set({summary: newSummary})
    .where('id', '=', meetingId)
    .execute()

  return newSummary
}
