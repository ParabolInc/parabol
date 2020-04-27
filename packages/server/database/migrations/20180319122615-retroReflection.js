import {
  CHECKIN,
  DISCUSS,
  GROUP,
  LOBBY,
  REFLECT,
  RETROSPECTIVE,
  SUMMARY,
  VOTE
} from 'parabol-client/utils/constants'

exports.up = async (r) => {
  try {
    await Promise.all([
      r.tableDrop('RetroThought').run(),
      r.tableDrop('RetroThoughtGroup').run(),
      r.tableCreate('RetroReflection').run(),
      r.tableCreate('RetroReflectionGroup').run()
    ])
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r
        .table('RetroReflection')
        .indexCreate('meetingId')
        .run(),
      r
        .table('RetroReflection')
        .indexCreate('reflectionGroupId')
        .run(),
      r
        .table('RetroReflectionGroup')
        .indexCreate('meetingId')
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
        phaseTypes: [LOBBY, CHECKIN, REFLECT, GROUP, VOTE, DISCUSS, SUMMARY]
      })
      .run()
  } catch (e) {
    // noop
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([
      r.tableCreate('RetroThought').run(),
      r.tableCreate('RetroThoughtGroup').run(),
      r.tableDrop('RetroReflection').run(),
      r.tableDrop('RetroReflectionGroup').run()
    ])
  } catch (e) {
    // noop
  }
}
