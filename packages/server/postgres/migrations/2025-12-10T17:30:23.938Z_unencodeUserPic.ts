import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db
      .updateTable('User')
      .set({
        picture: sql`REPLACE(REPLACE(REPLACE("picture", '%7C', '|'), '%2F', '/'), '%3A', ':')`
      })
      .where(sql<boolean>`STRPOS(picture, '%') > 0`)
      .$call((qb) => {
        console.log(qb.compile().sql, qb.compile().parameters)
        return qb
      })
      .execute(),
    db
      .updateTable('Notification')
      .set({
        senderPicture: sql`REPLACE(REPLACE(REPLACE("senderPicture", '%7C', '|'), '%2F', '/'), '%3A', ':')`,
        picture: sql`REPLACE(REPLACE(REPLACE("picture", '%7C', '|'), '%2F', '/'), '%3A', ':')`
      })
      .where((eb) =>
        eb.or([
          sql<boolean>`STRPOS(picture, '%') > 0`,
          sql<boolean>`STRPOS("senderPicture", '%') > 0`
        ])
      )
      .$call((qb) => {
        console.log(qb.compile().sql, qb.compile().parameters)
        return qb
      })
      .execute()
  ])
}

export async function down(db: Kysely<any>): Promise<void> {
  // noop
}
