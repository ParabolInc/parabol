import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'

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
  resolve: async (_source, {meetingId, stageId}, {dataLoader}) => {
    console.log('meetingId:', meetingId)
    console.log('stageId:', stageId)
    const reflectionGroups = await dataLoader
      .get('retroReflectionGroupsByMeetingId')
      .load(meetingId)
    console.log('reflection groups:', reflectionGroups)
    const reflectionGroupIds = reflectionGroups.map((rg) => rg.id)
    console.log('reflection group ids:', reflectionGroupIds)
    const r = await getRethink()
    await Promise.all([
      r
        .table('Comment')
        .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
        .delete()
        .run(),
      r
        .table('Task')
        .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
        .delete()
        .run(),
      r
        .table('RetroReflectionGroup')
        .getAll(r.args(reflectionGroupIds))
        .update({voterIds: []})
        .run()
    ])

    return true
  }
}

export default resetMeetingToStage
