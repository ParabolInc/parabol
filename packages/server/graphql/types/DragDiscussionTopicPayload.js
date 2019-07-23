import {GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import NewMeeting from 'server/graphql/types/NewMeeting'
import RetroDiscussStage from 'server/graphql/types/RetroDiscussStage'
import {DISCUSS} from 'universal/utils/constants'

const DragDiscussionTopicPayload = new GraphQLObjectType({
  name: 'DragDiscussionTopicPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    stage: {
      type: RetroDiscussStage,
      resolve: async ({meetingId, stageId}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {phases} = meeting
        const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS)
        const {stages} = discussPhase
        return stages.find((stage) => stage.id === stageId)
      }
    }
  })
})

export default DragDiscussionTopicPayload
