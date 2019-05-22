import shortid from 'shortid'

// This deprecates the SlackIntegration table as well as all slack rows in the Provider table
exports.up = async (r) => {
  try {
    await Promise.all([r.tableCreate('SlackAuth')])
  } catch (e) {
    /**/
  }
  try {
    await Promise.all([
      r.table('SlackAuth').indexCreate('userId'),
      r.table('SlackAuth').indexCreate('teamId'),
      r.table('SlackNotification').indexCreate('userId'),
      r.table('SlackNotification').indexCreate('teamId')
    ])
  } catch (e) {
    /**/
  }
  const slackProviders = await r
    .table('Provider')
    .filter({isActive: true, service: 'SlackIntegration'})
  const slackAuths = slackProviders.map((provider) => ({
    id: provider.id,
    isActive: true,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
    teamId: provider.teamId,
    userId: provider.userId,
    accessToken: provider.accessToken
  }))
  try {
    await r.table('SlackAuth').insert(slackAuths)
  } catch (e) {
    console.log(e)
  }

  const slackIntegrations = await r.table('SlackIntegration').filter({isActive: true})
  const slackNotifications = []
  slackIntegrations.forEach((integration) => {
    const slackAuth = slackAuths.find((auth) => auth.teamId === integration.teamId)
    if (!slackAuth) return
    const notifications = ['meetingStart', 'meetingEnd'].map((event) => ({
      id: shortid.generate(),
      isActive: true,
      channelId: integration.channelId,
      channelName: integration.channelName,
      teamId: integration.teamId,
      userId: slackAuth.userId,
      event
    }))
    slackNotifications.push(...notifications)
  })
  try {
    await r.table('SlackNotification').insert(slackNotifications)
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('SlackAuth'), r.tableDrop('SlackNotification')])
  } catch (e) {
    /**/
  }
}
