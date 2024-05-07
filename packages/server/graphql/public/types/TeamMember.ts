import {TeamMemberResolvers} from '../resolverTypes'

const TeamMember: TeamMemberResolvers = {
  isOrgAdmin: async ({teamId, userId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({userId, orgId: team.orgId})
    return organizationUser?.role === 'ORG_ADMIN'
  },
  picture: async ({picture}, _args, {dataLoader}) => {
    return dataLoader.get('fileStoreAsset').load(picture)
  }
}

export default TeamMember
