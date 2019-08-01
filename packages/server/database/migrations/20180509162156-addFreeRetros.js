import {PRO} from '../../../client/utils/constants'

exports.up = async (r) => {
  try {
    await r.table('Organization').update((org) => {
      return r.branch(
        org('tier').eq(PRO),
        {
          retroMeetingsOffered: 0,
          retroMeetingsRemaining: 0
        },
        {
          retroMeetingsOffered: 3,
          retroMeetingsRemaining: 3
        }
      )
    })
  } catch (e) {
    // noop
  }
}

exports.down = async (r) => {
  try {
    await r
      .table('Organization')
      .replace((org) => org.without('retroMeetingsOffered', 'retroMeetingsRemaining'))
  } catch (e) {
    // noop
  }
}
