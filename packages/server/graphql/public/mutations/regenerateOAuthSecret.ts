import {Kysely} from 'kysely'
import generateRandomString from '../../../generateRandomString'
import type {DB} from '../../../oauth/dbTypes'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'

const regenerateOAuthSecret = async (
  _source: any,
  {input: {orgId}}: {input: {orgId: string}},
  {authToken, dataLoader}: any
) => {
  // AUTH
  const viewerId = getUserId(authToken)
  if (!(await isUserOrgAdmin(viewerId, orgId, dataLoader))) {
    return standardError(new Error('Not organization lead'), {
      userId: viewerId
    })
  }

  const newSecret = generateRandomString(32)

  // RESOLUTION
  const db = getKysely() as unknown as Kysely<DB>
  await db
    .updateTable('Organization')
    .set({
      oauthClientSecret: newSecret
    })
    .where('id', '=', orgId)
    .execute()

  return {secret: newSecret}
}

export default regenerateOAuthSecret
