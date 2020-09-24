import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'

const resetMeetingToStage = {
  type: GraphQLNonNull(GraphQLBoolean),
  description: `Reset meeting to a previously completed stage`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_source, {meetingId, stageId}, context) => {
    console.log('reset meeting to stage mutation invoked on server!')
    console.log('meetingId:', meetingId)
    console.log('stageId:', stageId)
    console.log(context)
    return true
  }
}

export default resetMeetingToStage
