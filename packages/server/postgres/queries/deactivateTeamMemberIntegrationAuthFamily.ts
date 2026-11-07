import getKysely from '../getKysely'
import type {TeamMemberIntegrationAuth} from '../types'

const deactivateTeamMemberIntegrationAuthFamily = async (
  auth: Pick<TeamMemberIntegrationAuth, 'userId' | 'teamId' | 'providerId' | 'providerUserId'>
): Promise<void> => {
  const {userId, teamId, providerId, providerUserId} = auth
  await getKysely()
    .updateTable('TeamMemberIntegrationAuth')
    .set({isActive: false})
    .where('userId', '=', userId)
    .where('providerId', '=', providerId)
    .where('isActive', '=', true)
    .$if(providerUserId === null, (qb) => qb.where('teamId', '=', teamId))
    .$if(providerUserId !== null, (qb) => qb.where('providerUserId', '=', providerUserId))
    .execute()
}

export default deactivateTeamMemberIntegrationAuthFamily
