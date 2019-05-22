import shortid from 'shortid'

export default class SlackAuth {
  id = shortid.generate()
  isActive = true
  updatedAt = new Date()
  createdAt = new Date()

  constructor (public accessToken: string, public teamId: string, public userId: string) {}
}
