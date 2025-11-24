import {Kysely} from 'kysely'
import generateRandomString from '../../../generateRandomString'
import type {DB} from '../../../oauth/dbTypes'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'

const updateOAuthSettings = async (
  _source: any,
  {
    input: {orgId, redirectUris, scopes, enabled}
  }: {input: {orgId: string; redirectUris: string[]; scopes: string[]; enabled?: boolean}},
  {authToken, dataLoader}: any
) => {
  // AUTH
  const viewerId = getUserId(authToken)

  if (!(await isUserOrgAdmin(viewerId, orgId, dataLoader))) {
    return standardError(new Error('Not organization lead'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  const db = getKysely() as unknown as Kysely<DB>

  let updateData: any = {
    oauthRedirectUris: redirectUris,
    oauthScopes: scopes
  }

  if (enabled === true) {
    // Check if credentials exist
    const existingOrg = await db
      .selectFrom('Organization')
      .select(['oauthClientId', 'oauthClientSecret'])
      .where('id', '=', orgId)
      .executeTakeFirst()

    if (!existingOrg?.oauthClientId) {
      updateData.oauthClientId = generateRandomString(16)
    }
    if (!existingOrg?.oauthClientSecret) {
      updateData.oauthClientSecret = generateRandomString(32)
    }
  } else if (enabled === false) {
    // Clear credentials if explicitly disabled
    updateData.oauthClientId = null
    updateData.oauthClientSecret = null
  }
  // If enabled is undefined, we don't change credentials (just update settings)

  const updatedOrg = await db
    .updateTable('Organization')
    .set(updateData)
    .where('id', '=', orgId)
    .returningAll()
    .executeTakeFirst()

  return {success: true, organization: updatedOrg}
}

export default updateOAuthSettings
