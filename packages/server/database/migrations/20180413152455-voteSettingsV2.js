import { RETROSPECTIVE } from 'parabol-client/utils/constants'

// the first voteSettings did not take (possible merge conflict?) trying again
exports.up = async (r) => {
  try {
    await r.tableCreate('MeetingMember').run()
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r
        .table('MeetingMember')
        .indexCreate('meetingId')
        .run(),
      r
        .table('MeetingMember')
        .indexCreate('teamId')
        .run(),
      r
        .table('MeetingMember')
        .indexCreate('userId')
        .run()
    ])
  } catch (e) {
    // noop
  }
  try {
    await r
      .table('MeetingSettings')
      .filter({ meetingType: RETROSPECTIVE })
      .update({
        totalVotes: 5,
        maxVotesPerGroup: 3
      })
      .run()
  } catch (e) {
    // noop
  }
}

exports.down = async (r) => {
  try {
    await r
      .table('MeetingSettings')
      .filter({ meetingType: RETROSPECTIVE })
      .replace((settings) => settings.without('totalVotes', 'maxVotesPerGroup'))
      .run()
  } catch (e) {
    // noop
  }
  try {
    await r.tableDrop('MeetingMember').run()
  } catch (e) {
    // noop
  }
}
