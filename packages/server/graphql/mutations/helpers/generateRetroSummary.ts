import yaml from 'js-yaml'
import getKysely from '../../../postgres/getKysely'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'
import {transformRetroToAIFormat} from './transformRetroToAIFormat'

const setSummaryToNull = async (meetingId: string) => {
  const pg = getKysely()
  await pg.updateTable('NewMeeting').set({summary: null}).where('id', '=', meetingId).execute()
  return null
}

export const generateRetroSummary = async (
  meetingId: string,
  dataLoader: DataLoaderWorker,
  prompt?: string
): Promise<string | null> => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId} = meeting

  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const isAISummaryAccessible = await canAccessAI(team, dataLoader)
  if (!isAISummaryAccessible) {
    return setSummaryToNull(meetingId)
  }

  const transformedMeeting = await transformRetroToAIFormat(meetingId, dataLoader)
  if (!transformedMeeting || transformedMeeting.length === 0) {
    return setSummaryToNull(meetingId)
  }

  const yamlData = yaml.dump(transformedMeeting, {
    noCompatMode: true
  })

  const manager = new OpenAIServerManager()
  const newSummary = await manager.generateSummary(yamlData, prompt)
  if (!newSummary) {
    return setSummaryToNull(meetingId)
  }

  const pg = getKysely()
  await pg
    .updateTable('NewMeeting')
    .set({summary: newSummary})
    .where('id', '=', meetingId)
    .execute()

  return newSummary
}
