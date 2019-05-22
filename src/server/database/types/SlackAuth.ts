import shortid from 'shortid'

interface Input {
  accessToken: string
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
  createdAt: Date
  accessToken: string
  teamId: string
  userId: string
  slackTeamId: string
  slackTeamName: string
  slackUserId: string
  slackUserName: string

  constructor (input: Input) {
    const {
      accessToken,
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
    this.teamId = teamId
    this.userId = userId
    this.slackTeamId = slackTeamId
    this.slackTeamName = slackTeamName
    this.slackUserId = slackUserId
    this.slackUserName = slackUserName
  }
}
