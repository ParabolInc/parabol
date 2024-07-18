import yaml from 'js-yaml'
import getKysely from '../../../postgres/getKysely'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import sendToSentry from '../../../utils/sendToSentry'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'
import {getSummaries} from './helpers/getSummaries'
import {getTopics} from './helpers/getTopics'

const generateInsight: MutationResolvers['generateInsight'] = async (
  _source,
  {teamId, startDate, endDate, useSummaries = true},
  {dataLoader}
) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return standardError(
      new Error('Invalid date format. Please use ISO 8601 format (e.g., 2024-01-01T00:00:00Z).')
    )
  }
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000
  if (end.getTime() - start.getTime() < oneWeekInMs) {
    return standardError(new Error('The end date must be at least one week after the start date.'))
  }
  const pg = getKysely()

  // const existingInsight = await pg
  //   .selectFrom('Insight')
  //   .selectAll()
  //   .where('teamId', '=', teamId)
  //   .where('startDateTime', '=', start)
  //   .where('endDateTime', '=', end)
  //   .limit(1)
  //   .executeTakeFirst()

  // if (existingInsight) {
  //   return {
  //     wins: existingInsight.wins,
  //     challenges: existingInsight.challenges
  //   }
  // }

  const meetingsContent = useSummaries
    ? await getSummaries(teamId, startDate, endDate, dataLoader)
    : await getTopics(teamId, startDate, endDate, dataLoader)

  if (meetingsContent.length === 0) {
    return standardError(new Error('No meeting content found for the specified date range.'))
  }

  const yamlData = yaml.dump(meetingsContent, {
    noCompatMode: true
  })

  const openAI = new OpenAIServerManager()
  const rawInsight = await openAI.generateInsight(yamlData)
  if (!rawInsight) {
    return standardError(new Error('Unable to generate insight.'))
  }

  const meetingURL = 'https://action.parabol.co/meet/'

  const processLines = (lines: string[]): string => {
    return lines
      .map((line) => {
        if (line.includes(meetingURL)) {
          let processedLine = line
          const regex = new RegExp(`${meetingURL}\\S+`, 'g')
          const matches = processedLine.match(regex) || []

          let isValid = true
          matches.forEach((match) => {
            let shortMeetingId = match.split(meetingURL)[1]?.split(/[),\s]/)[0] // Split by closing parenthesis, comma, or space
            const actualMeetingId = shortMeetingId && (idLookup.meeting[shortMeetingId] as string)

            if (shortMeetingId && actualMeetingId) {
              processedLine = processedLine.replace(shortMeetingId, actualMeetingId)
            } else {
              const error = new Error(
                `AI hallucinated. Unable to find meetingId for ${shortMeetingId}. Line: ${line}`
              )
              sendToSentry(error)
              isValid = false
            }
          })
          return isValid ? processedLine : '' // Return empty string if invalid
        }
        return line
      })
      .filter((line) => line.trim() !== '')
      .join('\n')
  }

  const processSection = (section: string[]): string => {
    return section
      .map((item) => {
        const lines = item.split('\n')
        return processLines(lines)
      })
      .filter((processedItem) => processedItem.trim() !== '')
      .join('\n')
  }

  console.log('🚀 ~ batch.wins:', rawInsight.wins)
  // const wins = processSection(rawInsight.wins)
  // console.log('🚀 ~ wins:', wins)

  // const challenges = processSection(rawInsight.challenges)
  console.log('🚀 ~ rawInsight.challenges:', rawInsight.challenges)
  // console.log('🚀 ~ challenges:', challenges)
  // await pg
  //   .insertInto('Insight')
  //   .values({
  //     teamId,
  //     wins,
  //     challenges,
  //     startDate,
  //     endDate
  //   })
  //   .execute()

  const data = {wins: rawInsight.wins[0], challenges: rawInsight.challenges[0]}
  return data
}

export default generateInsight
