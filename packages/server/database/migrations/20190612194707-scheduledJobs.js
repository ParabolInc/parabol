import generateUID from '../../generateUID'

exports.up = async (r) => {
  try {
    await r.tableCreate('ScheduledJob').run()
  } catch (e) {
    console.log(e)
  }
  try {
    await r
      .table('ScheduledJob')
      .indexCreate('type')
      .run()
    await r
      .table('ScheduledJob')
      .indexCreate('runAt')
      .run()
  } catch (e) {
    console.log(e)
  }

  try {
    const slackUsers = await r
      .table('SlackAuth')
      .filter({isActive: true})
      .run()
    const slackNotifications = await r
      .table('SlackNotification')
      .pluck('userId', 'teamId', 'channelId')
      .distinct()
      .run()
    const stageCompleteNotifications = slackUsers.map((slackUser) => {
      const {userId, teamId} = slackUser
      return {
        userId,
        teamId,
        channelId: null,
        event: 'MEETING_STAGE_TIME_LIMIT_END',
        id: generateUID()
      })
    })
    const stageReadyNotifications = slackUsers.map((slackUser) => {
      const {userId, teamId} = slackUser
      const teamMemberNotification = slackNotifications.find(
        (notification) => notification.teamId === teamId && notification.userId === userId
      )
      const channelId = (teamMemberNotification && teamMemberNotification.channelId) || null
      return new SlackNotification({
        userId,
        teamId,
        channelId,
        event: 'MEETING_STAGE_TIME_LIMIT_START'
      })
    })
    const authUpdates = slackUsers.map((slackUser) => {
      const {userId, teamId} = slackUser
      const teamMemberNotification = slackNotifications.find(
        (notification) =>
          notification.teamId === teamId && notification.userId === userId && notification.channelId
      )
      return {
        id: slackUser.id,
        channelId: (teamMemberNotification && teamMemberNotification.channelId) || null
      }
    })
    const records = [...stageCompleteNotifications, ...stageReadyNotifications]
    await r
      .table('SlackNotification')
      .filter({event: 'meetingStageTimeLimit'})
      .update({event: 'MEETING_STAGE_TIME_LIMIT_END'})
      .run()
    await r
      .table('SlackNotification')
      .insert(records)
      .run()
    await r(authUpdates)
      .forEach((auth) => {
        return r
          .table('SlackAuth')
          .get(auth('id'))
          .update({
            defaultTeamChannelId: auth('channelId')
          })
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('ScheduledJob').run()
  } catch (e) {
    console.log(e)
  }
}
