import {
  CHECKIN,
  DISCUSS,
  GROUP,
  LOBBY,
  REFLECT,
  RETROSPECTIVE,
  SUMMARY,
  VOTE
} from '../../../client/utils/constants'

exports.up = async (r) => {
  try {
    await Promise.all([
      r.tableDrop('RetroThought'),
      r.tableDrop('RetroThoughtGroup'),
      r.tableCreate('RetroReflection'),
      r.tableCreate('RetroReflectionGroup')
    ])
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r.table('RetroReflection').indexCreate('meetingId'),
      r.table('RetroReflection').indexCreate('reflectionGroupId'),
      r.table('RetroReflectionGroup').indexCreate('meetingId')
    ])
  } catch (e) {
    // noop
  }
  try {
    await r
      .table('MeetingSettings')
      .filter({meetingType: RETROSPECTIVE})
      .update({
        phaseTypes: [LOBBY, CHECKIN, REFLECT, GROUP, VOTE, DISCUSS, SUMMARY]
      })
  } catch (e) {
    // noop
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([
      r.tableCreate('RetroThought'),
      r.tableCreate('RetroThoughtGroup'),
      r.tableDrop('RetroReflection'),
      r.tableDrop('RetroReflectionGroup')
    ])
  } catch (e) {
    // noop
  }
}
