import {RetroDemo} from '~/types/constEnums'
import {demoViewerId} from './initDB'

export default class DemoUser {
  __typename = 'User'
  id: string
  viewerId: string
  createdAt = new Date().toJSON()
  email: string
  featureFlags = {
    azureDevOps: false,
    msTeams: false
  }
  facilitatorUserId: string
  facilitatorName: string
  inactive = false
  isConnected = true
  lastSeenAtURLs = [`/meet/${RetroDemo.MEETING_ID}`]
  lastSeenAt = new Date().toJSON()

  rasterPicture: string
  picture: string
  preferredName: string
  tms = [RetroDemo.TEAM_ID]
  constructor(preferredName: string, email: string, picture: string, idx: number) {
    this.id = idx === 0 ? demoViewerId : `bot${idx}`
    this.preferredName = preferredName
    this.email = email
    this.picture = picture
    this.rasterPicture = picture
    this.facilitatorName = preferredName
    this.facilitatorUserId = this.id
    this.viewerId = this.id
  }
}
