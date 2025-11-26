import {Kysely} from 'kysely'
import type {DB} from '../../../../oauth/dbTypes'
import getKysely from '../../../../postgres/getKysely'

export default async function oauthProviders(organization: {id: string}) {
  const db = getKysely() as unknown as Kysely<DB>
  return await db
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('organizationId', '=', organization.id)
    .orderBy('createdAt', 'desc')
    .execute()
}
