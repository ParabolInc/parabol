exports.up = async (r) => {
  // these are the only notification types in the prod database as of 9/6/17
  const tables = [
    r
      .table('Notification')
      .filter({type: 'REQUEST_NEW_USER'})
      .replace((row) => {
        return row
          .merge({
            inviterUserId: row('varList')(0),
            inviterName: row('varList')(1),
            inviteeEmail: row('varList')(2),
            teamId: row('varList')(3),
            teamName: row('varList')(4)
          })
          .without('varList')
      })
      .run(),
    r
      .table('Notification')
      .filter({type: 'TEAM_ARCHIVED'})
      .replace((row) => {
        return row
          .merge({
            teamName: row('varList')(0)
          })
          .without('varList')
      })
      .run(),
    r
      .table('Notification')
      .filter((row) => row('type').match('^TRIAL_'))
      .replace((row) => {
        return row
          .merge({
            trialExpiresAt: row('varList')(0)
          })
          .without('varList')
      })
      .run()
  ]
  try {
    await Promise.all(tables)
  } catch (e) {
    console.log('Exception during Promise.all(tables)')
  }
}

exports.down = async () => {
  // noop
}
