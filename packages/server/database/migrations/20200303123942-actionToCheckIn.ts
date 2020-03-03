export const up = function(r) {
  try {
    await r
      .table('NewMeeting')
      .update((meeting) => ({
        name: r.js(`${meeting}("name").replace("Action meeting", "Check-in")`)
      }))
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = function(r) {
  try {
    await r
      .table('NewMeeting')
      .update((meeting) => ({
        name: r.js(`${meeting}("name").replace("Check-in", "Action meeting")`)
      }))
      .run()
  } catch (e) {
    console.log(e)
  }
}
