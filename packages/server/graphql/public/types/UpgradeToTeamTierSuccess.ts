// import {UpgradeToTeamTierSuccessResolvers} from '../resolverTypes'

export type UpgradeToTeamTierSuccessSource = {
  orgId: string
  teamIds: string[]
  meetingIds: string[]
}

const UpgradeToTeamTierSuccess: any = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').load(orgId)
  },
  teams: async ({teamIds}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadMany(teamIds)
  },
  meetings: async ({meetingIds}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadMany(meetingIds)
  }
}

export default UpgradeToTeamTierSuccess
