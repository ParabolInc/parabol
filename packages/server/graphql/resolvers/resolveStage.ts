import type GenericMeetingPhase from '../../database/types/GenericMeetingPhase'
import type {Newmeetingphasetypeenum} from '../../postgres/types/pg'
import type {GQLContext} from './../graphql'
import {augmentDBStage} from '../resolvers'

const resolveStage =
  (phaseType: Newmeetingphasetypeenum) =>
  async (
    {meetingId, stageId}: {meetingId: string; stageId: string},
    _args: unknown,
    {dataLoader}: GQLContext
  ) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {phases, teamId} = meeting
    const phase = phases.find((phase: GenericMeetingPhase) => phase.phaseType === phaseType)!
    const {stages} = phase
    const dbStage = stages.find((stage) => stage.id === stageId)!
    return augmentDBStage(dbStage, meetingId, phaseType, teamId)
  }

export default resolveStage
