import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import getKysely from '../../../postgres/getKysely'
import {TeamPromptResponseStageResolvers} from '../resolverTypes'

const TeamPromptResponseStage: TeamPromptResponseStageResolvers = {
  questions: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingTeamPrompt

    const pg = getKysely()
    const questions = await pg
      .selectFrom('TeamPromptQuestion')
      .selectAll()
      .where('templateId', '=', meeting.templateId)
      .execute()

    return questions.map((question) => ({...question, id: question.id}))
  }
}

export default TeamPromptResponseStage
