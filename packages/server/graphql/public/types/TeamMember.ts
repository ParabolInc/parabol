import {TeamMemberResolvers} from '../resolverTypes'

const TeamMember: TeamMemberResolvers = {
  isOrgAdmin: async ({teamId, userId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({userId, orgId: team.orgId})
    return organizationUser?.role === 'ORG_ADMIN'
  }
}

export default TeamMember
