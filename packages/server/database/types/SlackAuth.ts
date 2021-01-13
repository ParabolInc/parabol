import shortid from 'shortid'

interface Input {
  accessToken: string
  botUserId: string
  botAccessToken: string
  defaultTeamChannelId: string
  teamId: string
  userId: string
  slackTeamId: string
  slackTeamName: string
  slackUserId: string
  slackUserName: string
  id?: string
  createdAt?: Date
}

export default class SlackAuth {
  isActive = true
  updatedAt = new Date()
  id: string
  botUserId: string
  botAccessToken: string
  createdAt: Date
  defaultTeamChannelId: string
  accessToken: string | null
  teamId: string
  userId: string
  slackTeamId: string
  slackTeamName: string
  slackUserId: string
  slackUserName: string

  constructor(input: Input) {
    const {
      accessToken,
      botUserId,
      botAccessToken,
      defaultTeamChannelId,
      teamId,
      userId,
      slackTeamId,
      slackTeamName,
      slackUserId,
      slackUserName,
      id,
      createdAt
    } = input
    this.id = id || shortid.generate()
    this.createdAt = createdAt || new Date()
    this.accessToken = accessToken
    this.botUserId = botUserId
    this.botAccessToken = botAccessToken
    this.defaultTeamChannelId = defaultTeamChannelId
    this.teamId = teamId
    this.userId = userId
    this.slackTeamId = slackTeamId
    this.slackTeamName = slackTeamName
    this.slackUserId = slackUserId
    this.slackUserName = slackUserName
  }
}
