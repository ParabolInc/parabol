exports.up = async (r) => {
  const changes = await r
    .table('User')
    .pluck('id', 'tms')
    .filter((doc) =>
      doc('tms')
        .count()
        .ne(0)
    )
    .concatMap((userDoc) => {
      return r.map(userDoc('tms'), (teamId) =>
        userDoc('id')
          .add('::')
          .add(teamId)
      )
    })
    .coerceTo('array')
    .do((teamMemberIds) => {
      return r
        .table('TeamMember')
        .getAll(r.args(teamMemberIds), {index: 'id'})
        .filter({isNotRemoved: false})
        .pluck('teamId', 'userId')
        .coerceTo('array')
    })
    .forEach((badTeamMember) => {
      return r
        .table('User')
        .get(badTeamMember('userId'))
        .update(
          (doc) => ({
            tms: doc('tms').difference([badTeamMember('teamId')])
          }),
          {returnChanges: true}
        )
    })('changes')
    .default([])
    .run()

  if (changes.length === 0) return

  // reduce it to 1 call per userId
  const smallestTMSperUser = changes.reduce((userObj, change) => {
    const {id: userId, tms} = change.new_val
    if (!userObj[userId] || userObj[userId].length < tms) {
      userObj[userId] = tms
    }
    return userObj
  }, {})

  const userIds = Object.keys(smallestTMSperUser)

  console.log(`Removed ${userIds.length} users from ${changes.length} teams`)
  const affectedUsers = changes.map((change) => change.new_val.preferredName).join()
  console.log('affected users: ', affectedUsers)
}

exports.down = async () => {
  // noop
}
