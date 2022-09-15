import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: 'retrospective'})
      .update({
        totalVotes: 5,
        maxVotesPerGroup: 3
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: 'retrospective'})
      .replace((row) => row.without('maxVotes', 'maxVotesPerGroup'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
