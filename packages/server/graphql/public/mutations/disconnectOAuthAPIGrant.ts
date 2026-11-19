import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const disconnectOAuthAPIGrant: MutationResolvers['disconnectOAuthAPIGrant'] = async (
  _source,
  {grantId},
  {dataLoader}
) => {
  const [dbGrantId] = CipherId.fromClient(grantId)
  const {userId} = await dataLoader.get('oauthAPIGrants').loadNonNull(dbGrantId)
  await getKysely()
    .updateTable('OAuthAPIGrant')
    .set({revokedAt: sql`CURRENT_TIMESTAMP`})
    .where('id', '=', dbGrantId)
    .where('revokedAt', 'is', null)
    .execute()
  dataLoader.get('oauthAPIGrants').clear(dbGrantId)
  return {userId}
}

export default disconnectOAuthAPIGrant
