import {MeetingSeriesResolvers} from '../resolverTypes'

const MeetingSeries: MeetingSeriesResolvers = {
  // approvedDomains: async ({id: orgId}, _args, {dataLoader}) => {
  //   return dataLoader.get('organizationApprovedDomainsByOrgId').load(orgId)
  // },
  // meetingStats: async ({id: orgId}, _args, {dataLoader}) => {
  //   return dataLoader.get('meetingStatsByOrgId').load(orgId)
  // },
  // teamStats: async ({id: orgId}, _args, {dataLoader}) => {
  //   return dataLoader.get('teamStatsByOrgId').load(orgId)
  // },
  // company: async ({activeDomain}, _args, {authToken}) => {
  //   if (!activeDomain || !isSuperUser(authToken)) return null
  //   return {id: activeDomain}
  // }
}

export default MeetingSeries
