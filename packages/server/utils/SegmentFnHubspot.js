



async function onTrack(event, settings) {
  const {hubspotKey, segmentFnKey} = settings

  const handlers = {
    'Meeting Completed': async () => {
      const query = `query MeetingCompleted($userId: String!) {
      user(userId: $userId) {

      }`
    }
  }

  const handler = handlers[event.event]
  if (!handler) return


  handler()

  const properties = event.properties
  const traits = properties.traits
  if (event.event === 'Conversion Modal Pay Later Clicked') {
    return await updatePayLaterClickedCount({
      count: properties.payLaterClickCount,
      email: traits.email,
      apiKey: settings.apiKey
    })
  }
}
