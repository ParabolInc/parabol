import isRevokedGrantError from '../integrations/platform/isRevokedGrantError'
import getKysely from '../postgres/getKysely'
import logError from '../utils/logError'

export type RefreshFailedAuth = {id: number; userId: string; teamId: string; service: string}

const handleAuthRefreshFailure = async (error: Error, auth: RefreshFailedAuth) => {
  const {id, userId, teamId, service} = auth
  logError(error, {userId, tags: {teamId, service}})
  if (!isRevokedGrantError(error)) return
  await getKysely()
    .updateTable('TeamMemberIntegrationAuth')
    .set({isActive: false})
    .where('id', '=', id)
    .execute()
}

export default handleAuthRefreshFailure
