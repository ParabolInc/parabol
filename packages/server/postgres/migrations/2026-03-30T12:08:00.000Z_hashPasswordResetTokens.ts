import crypto from 'crypto'
import {type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 86400000)
  const rows = await db
    .selectFrom('PasswordResetRequest')
    .select(['id', 'token'])
    .where('isValid', '=', true)
    .where('time', '>=', oneDayAgo)
    .execute()

  await Promise.all(
    rows.map(({id, token}) => {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      return db
        .updateTable('PasswordResetRequest')
        .set({token: tokenHash})
        .where('id', '=', id)
        .execute()
    })
  )

  await db.schema.alterTable('PasswordResetRequest').renameColumn('token', 'tokenHash').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('PasswordResetRequest').renameColumn('tokenHash', 'token').execute()
  // Plaintext tokens cannot be recovered from hashes; invalidate all tokens
  await db.updateTable('PasswordResetRequest').set({isValid: false}).execute()
}
