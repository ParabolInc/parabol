import {
  CHECKIN,
  DISCUSS,
  GROUP,
  REFLECT,
  RETROSPECTIVE,
  VOTE
} from 'parabol-client/utils/constants'

exports.up = async (r) => {
  try {
    await r
      .table('MeetingSettings')
      .filter({ meetingType: RETROSPECTIVE })
      .update({
        phaseTypes: [CHECKIN, REFLECT, GROUP, VOTE, DISCUSS]
      })
      .run()
  } catch (e) {
    // noop
  }
}

exports.down = async () => {
  // noop
}
