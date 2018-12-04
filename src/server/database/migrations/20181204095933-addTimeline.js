import shortid from 'shortid'
import {JOINED_PARABOL} from 'server/graphql/types/TimelineEventTypeEnum'

exports.up = async (r) => {
  try {
    await r.tableCreate('TimelineEvent')
  } catch (e) {}
  try {
    await r
      .table('TimelineEvent')
      .indexCreate('userIdCreatedAt', (row) => [row('userId'), row('createdAt')])
  } catch (e) {}

  const users = await r.table('User').pluck('id', 'createdAt')
  // const teams =
  // account created
  const joinedParabolEvents = users.map((user) => {
    return {
      id: shortid.generate(),
      createdAt: user.createdAt,
      interactionCount: 0,
      seenCount: 0,
      eventType: JOINED_PARABOL,
      userId: user.id
    }
  })
  console.log('joinedP', joinedParabolEvents)
  // action meeting completed
}

exports.down = async (r) => {
  try {
    await r.tableDrop('TimelineEvent')
  } catch (e) {}
}
