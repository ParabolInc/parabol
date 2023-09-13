import {getUserId, isSuperUser} from '../../../utils/authorization'
import {OrganizationResolvers} from '../resolverTypes'
import {CreateOneOnOneTeamInput} from '../../private/resolverTypes'
import {GQLContext} from '../../graphql'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getExistingOneOnOneTeam} from '../../mutations/helpers/getExistingOneOnOneTeam'
import {mapToTeam} from '../../../postgres/queries/getTeamsByIds'
import {IGetTeamsByIdsQueryResult} from '../../../postgres/queries/generated/getTeamsByIdsQuery'

const Organization: OrganizationResolvers = {
  approvedDomains: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizationApprovedDomainsByOrgId').load(orgId)
  },
  meetingStats: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingStatsByOrgId').load(orgId)
  },
  teamStats: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('teamStatsByOrgId').load(orgId)
  },
  company: async ({activeDomain}, _args, {authToken}) => {
    if (!activeDomain || !isSuperUser(authToken)) return null
    return {id: activeDomain}
  },
  featureFlags: ({featureFlags}) => {
    if (!featureFlags) return {}
    return Object.fromEntries(featureFlags.map((flag) => [flag as any, true]))
  },
  oneOnOneTeam: async (
    _: any,
    {oneOnOneTeamInput}: {oneOnOneTeamInput: CreateOneOnOneTeamInput},
    context: GQLContext
  ) => {
    const {authToken} = context

    const {email, orgId} = oneOnOneTeamInput

    const viewerId = getUserId(authToken)

    const existingUser = await getUserByEmail(email)

    if (!existingUser) {
      return null
    }

    // TODO: refactor mapToTeam to use kysely and remove IGetTeamsByIdsQueryResult
    const existingTeam = (await getExistingOneOnOneTeam(
      existingUser.id,
      viewerId,
      orgId
    )) as IGetTeamsByIdsQueryResult
    if (existingTeam) {
      return mapToTeam([existingTeam])[0] ?? null
    }

    return null
  }
}

export default Organization
