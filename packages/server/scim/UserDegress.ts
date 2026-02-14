import SCIMMY from 'scimmy'
import {hardDeleteUser} from './hardDeleteUser'
import {logSCIMRequest} from './logSCIMRequest'
import {reservedUserIds} from './reservedIds'
import {SCIMContext} from './SCIMContext'

SCIMMY.Resources.declare(SCIMMY.Resources.User).degress(async (resource, ctx: SCIMContext) => {
  const {ip, authToken, dataLoader} = ctx
  const scimId = authToken.sub!
  const {id: userId} = resource

  logSCIMRequest(scimId, ip, {operation: `User degress`})
  if (reservedUserIds.includes(userId ?? '')) {
    throw new SCIMMY.Types.Error(403, '', 'Forbidden')
  }

  if (!userId) {
    throw new SCIMMY.Types.Error(400, 'invalidValue', 'User ID is required for degress')
  }

  await hardDeleteUser({userId, scimId, dataLoader})
})
