import {GraphQLInt} from 'graphql'

const endOldMeetings = {
  type: GraphQLInt,
  description: 'close all meetings that started before the given threshold',
  resolve: async () => {
    // meetings are async now, can't safely end old ones
    return 0

    // const r = await getRethink()

    // AUTH
    // requireSU(authToken)

    // RESOLUTION
    // const activeThresh = new Date(Date.now() - OLD_MEETING_AGE)
    // const meetingIdsInProgress = await r
    //   .table('Team')
    //   .filter((team) =>
    //     team('meetingId')
    //       .default(null)
    //       .ne(null)
    //   )('meetingId')
    //   .run()
    //
    // const meetings = (await r
    //   .table('NewMeeting')
    //   .getAll(r.args(meetingIdsInProgress), {index: 'id'})
    //   .filter((meeting) => meeting('createdAt').le(activeThresh))
    //   .pluck('id', 'meetingType')
    //   .run()) as {id: string; meetingType: string}[]
    //
    // await Promise.all(
    //   meetings.map((meeting) => {
    //       meetingId: meeting.id
    //     }).catch()
    //     if (meeting.meetingType === 'action') {
    //       return endNewMeeting.resolve(undefined, {meetingId: meeting.id}, {
    //         authToken,
    //         socketId: '',
    //         dataLoader
    //       } as GQLContext)
    //     }
    //     return undefined as any
    //   })
    // )
    //
    // return meetings.length
  }
}

export default endOldMeetings
