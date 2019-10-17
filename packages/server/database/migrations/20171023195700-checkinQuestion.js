import {ContentState, convertToRaw} from 'draft-js'

exports.up = async (r) => {
  const teamsWithActiveMeetings = await r
    .table('Team')
    .filter((team) =>
      team('checkInQuestion')
        .default(null)
        .ne(null)
    )
    .pluck('id', 'checkInQuestion')
    .run()

  await Promise.all(
    teamsWithActiveMeetings.map((team) => {
      const contentState = ContentState.createFromText(team.checkInQuestion)
      const raw = convertToRaw(contentState)
      const checkInQuestion = JSON.stringify(raw)
      return r
        .table('Team')
        .get(team.id)
        .update({checkInQuestion})
        .run()
    })
  )
}

exports.down = async () => {
  // noop
}
