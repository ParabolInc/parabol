import {CHECKIN, DISCUSS, GROUP, REFLECT, RETROSPECTIVE, VOTE} from '../../../client/utils/constants'

exports.up = async (r) => {
  try {
    await r
      .table('MeetingSettings')
      .filter({meetingType: RETROSPECTIVE})
      .update({
        phaseTypes: [CHECKIN, REFLECT, GROUP, VOTE, DISCUSS]
      })
  } catch (e) {
    // noop
  }
}

exports.down = async () => {
  // noop
}
