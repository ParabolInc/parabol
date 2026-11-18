import {GraphQLError} from 'graphql'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {FlagReadyToAdvancePayloadResolvers} from '../resolverTypes'

export type FlagReadyToAdvancePayloadSource = {
  meetingId: string
  stageId: string
}

const FlagReadyToAdvancePayload: FlagReadyToAdvancePayloadResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  stage: async ({meetingId, stageId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const stageRes = findStageById(meeting.phases, stageId)
    if (!stageRes)
      throw new GraphQLError('Stage not found', {extensions: {code: 'INTERNAL_SERVER_ERROR'}})
    return {
      ...stageRes.stage,
      meetingId,
      teamId: meeting.teamId
    }
  }
}

export default FlagReadyToAdvancePayload
