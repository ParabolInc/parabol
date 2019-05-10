exports.up = async (r) => {
  try {
    await r
      .table('TimelineEvent')
      .filter({type: 'actionComplete'})
      .replace((row) => {
        return row.merge({legacyMeetingId: row('meetingId')}).without('meetingId')
      })
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r
      .table('TimelineEvent')
      .filter({type: 'actionComplete'})
      .replace((row) => {
        return row.merge({meetingId: row('legacyMeetingId')}).without('legacyMeetingId')
      })
  } catch (e) {
    console.log(e)
  }
}
