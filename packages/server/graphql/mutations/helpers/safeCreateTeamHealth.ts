import MeetingTeamHealth from '../../../database/types/MeetingTeamHealth'
import TeamHealthResponsePhase from '../../../database/types/TeamHealthResponsePhase'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import {primePhases} from './createNewMeetingPhases'

const safeCreateTeamHealth = async (
  input: {
    teamId: string
    facilitatorUserId: string
    templateId: string
    name?: string
    meetingSeriesId?: number
    scheduledEndTime?: Date | null
  },
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  const {teamId, facilitatorUserId, templateId, name, meetingSeriesId, scheduledEndTime} = input
  const meetingType = 'teamHealth' as const
  const [meetingCount, templateQuestions] = await Promise.all([
    dataLoader.get('meetingCount').load({teamId, meetingType}),
    dataLoader.get('teamHealthTemplateQuestionsByTemplateId').load(templateId)
  ])

  const questions = (
    await Promise.all(
      templateQuestions.map((tq) =>
        dataLoader.get('teamHealthQuestions').load(String(tq.questionId))
      )
    )
  ).filter(isValid)
  if (questions.length === 0) {
    throw new Error(`Team health template ${templateId} has no questions`)
  }

  // stages reference the immutable question by id, one stage per template question
  const questionIds = questions.map((question) => String(question.id))
  const phases: [TeamHealthResponsePhase] = [new TeamHealthResponsePhase({questionIds})]
  primePhases(phases)

  const meetingId = generateUID()
  const meeting = new MeetingTeamHealth({
    id: meetingId,
    teamId,
    meetingCount,
    name: name || `Team Health #${meetingCount + 1}`,
    phases,
    facilitatorUserId,
    templateId,
    meetingSeriesId,
    scheduledEndTime
  }) as TeamHealthMeeting

  try {
    await pg
      .insertInto('NewMeeting')
      .values({...meeting, phases: JSON.stringify(meeting.phases)})
      .execute()
  } catch {
    // meeting already started
    return null
  }
  return meeting
}

export default safeCreateTeamHealth
