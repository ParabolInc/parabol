import {type Kysely, sql} from 'kysely'
import type {DB} from '../postgres/types/pg'
import aiAppScopes from './aiAppScopes'

interface Input {
  clientId: string
  name: string
  redirectUris: string[]
}

const upsertMetadataDocumentProvider = (db: Kysely<DB>, {clientId, name, redirectUris}: Input) =>
  db
    .insertInto('OAuthAPIProvider')
    .values({
      clientId,
      name,
      clientType: 'public',
      clientSecret: null,
      orgId: null,
      verifiedAt: null,
      redirectUris,
      scopes: aiAppScopes
    })
    .onConflict((oc) =>
      oc
        .column('clientId')
        .doUpdateSet((eb) => ({
          redirectUris: eb.ref('excluded.redirectUris'),
          updatedAt: sql`now()`
        }))
        .where('OAuthAPIProvider.verifiedAt', 'is', null)
    )
    .execute()

export default upsertMetadataDocumentProvider
