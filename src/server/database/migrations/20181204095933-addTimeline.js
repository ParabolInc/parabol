import shortid from 'shortid'
import {
  COMPLETED_ACTION_MEETING,
  COMPLETED_RETRO_MEETING,
  JOINED_PARABOL
} from 'server/graphql/types/TimelineEventTypeEnum'

exports.up = async (r) => {
  try {
    await r.tableCreate('TimelineEvent')
  } catch (e) {}
  try {
    await r
      .table('TimelineEvent')
      .indexCreate('userIdCreatedAt', (row) => [row('userId'), row('createdAt')])
  } catch (e) {}

  const {users, completedActionMeetings, completedRetroMeetings} = await r({
    users: r
      .table('User')
      .pluck('id', 'createdAt', 'tms')
      .coerceTo('array'),
    completedActionMeetings: r
      .table('Meeting')
      .pluck('id', 'teamId', 'endedAt')
      .merge({eventType: COMPLETED_ACTION_MEETING})
      .coerceTo('array'),
    completedRetroMeetings: r
      .table('NewMeeting')
      .pluck('id', 'teamId', 'endedAt')
      .merge({eventType: COMPLETED_RETRO_MEETING})
      .coerceTo('array')
  })

  const completedMeetings = [...completedActionMeetings, ...completedRetroMeetings]

  // account created
  const events = []
  events.push(
    ...users.map((user) => {
      return {
        id: shortid.generate(),
        createdAt: user.createdAt,
        interactionCount: 0,
        seenCount: 0,
        eventType: JOINED_PARABOL,
        userId: user.id
      }
    })
  )

  // meetings completed
  const usersByTeamId = {}
  users.forEach((user) => {
    if (!user.tms) return
    user.tms.forEach((teamId) => {
      usersByTeamId[teamId] = usersByTeamId[teamId] || []
      usersByTeamId[teamId].push(user.id)
    })
  })

  completedMeetings.forEach((meeting) => {
    const userIds = usersByTeamId[meeting.teamId]
    if (!userIds) return
    const userEvents = userIds.map((userId) => ({
      id: shortid.generate(),
      createdAt: meeting.endedAt,
      interactionCount: 0,
      seenCount: 0,
      eventType: meeting.eventType,
      userId
    }))
    events.push(...userEvents)
  })
  await r.table('TimelineEvent').insert(events)
}

exports.down = async (r) => {
  try {
    await r.tableDrop('TimelineEvent')
  } catch (e) {}
}
