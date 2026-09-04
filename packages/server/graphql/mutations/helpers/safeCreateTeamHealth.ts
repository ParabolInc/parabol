import MeetingTeamHealth from '../../../database/types/MeetingTeamHealth'
import TeamHealthIntroPhase from '../../../database/types/TeamHealthIntroPhase'
import TeamHealthResponsePhase from '../../../database/types/TeamHealthResponsePhase'
import TeamHealthResultPhase from '../../../database/types/TeamHealthResultPhase'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import {primePhases} from './createNewMeetingPhases'
import rotateTeamHealthQuestionIds from './rotateTeamHealthQuestionIds'

const safeCreateTeamHealth = async (
  input: {
    teamId: string
    facilitatorUserId: string
    templateId: string
    name?: string
    meetingSeriesId?: number
    scheduledEndTime?: Date | null
    // Set only when this meeting is one of several a multi-team group opens for the same
    // occurrence, since they must all ask the same questions & the rotation breaks ties at
    // random. Left undefined otherwise, so a lone meeting rotates its own.
    questionIds?: number[]
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
      templateQuestions.map((tq) => dataLoader.get('teamHealthQuestions').load(tq.questionId))
    )
  ).filter(isValid)
  if (questions.length === 0) {
    throw new Error(`Team health template ${templateId} has no questions`)
  }

  // stages reference the immutable question by its raw id, one least-asked question per category
  const questionIds =
    input.questionIds ??
    (await rotateTeamHealthQuestionIds(questions, meetingSeriesId ? [meetingSeriesId] : []))
  // intro -> response (one stage per question) -> result (one stage per category), which is the
  // waiting room until the meeting ends and the answers are revealed in place
  const phases = [
    new TeamHealthIntroPhase(),
    new TeamHealthResponsePhase({questionIds}),
    new TeamHealthResultPhase({questionIds})
  ] as [TeamHealthIntroPhase, TeamHealthResponsePhase, TeamHealthResultPhase]
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
