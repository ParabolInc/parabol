export const up = async function (r) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: 'teamPrompt'})
      .update({
        meetingPrompt: 'What are you working on today? Stuck on anything?'
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: 'teamPrompt'})
      .replace(r.row.without('meetingPrompt'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
