import {type Kysely, sql} from 'kysely'

const getBaseUrl = () => {
  const cdnType = process.env.FILE_STORE_PROVIDER
  if (cdnType === 'local') {
    return `/self-hosted`
  } else {
    const CDN_BASE_URL = process.env.CDN_BASE_URL!
    const baseUrl = new URL(CDN_BASE_URL.replace(/^\/+/, 'https://'))
    baseUrl.pathname += '/store'
    return baseUrl.toString()
  }
}
export async function up(db: Kysely<any>): Promise<void> {
  const prefix = getBaseUrl()
  // update template URLs to new assets proxy server URLs
  await Promise.all([
    db
      .updateTable('User')
      .set({
        picture: sql`REPLACE("picture", ${prefix}, '/assets')`
      })
      .where((eb) =>
        eb.or([eb('picture', 'like', `${prefix}/%`), eb('rasterPicture', 'like', `${prefix}/%`)])
      )
      .execute(),
    db
      .updateTable('MeetingTemplate')
      .set({illustrationUrl: sql`REPLACE("illustrationUrl", ${prefix}, '/assets')`})
      .where('illustrationUrl', 'like', `${prefix}/%`)
      .execute(),
    db
      .updateTable('Organization')
      .set({picture: sql`REPLACE("picture", ${prefix}, '/assets')`})
      .where('picture', 'like', `${prefix}/%`)
      .execute(),
    db
      .updateTable('Notification')
      .set({
        senderPicture: sql`REPLACE("senderPicture", ${prefix}, '/assets')`,
        picture: sql`REPLACE("picture", ${prefix}, '/assets')`,
        orgPicture: sql`REPLACE("orgPicture", ${prefix}, '/assets')`
      })
      .where((eb) =>
        eb.or([
          eb('senderPicture', 'like', `${prefix}/%`),
          eb('picture', 'like', `${prefix}/%`),
          eb('orgPicture', 'like', `${prefix}/%`)
        ])
      )
      .execute(),
    db
      .updateTable('SAML')
      .set({metadataURL: sql`REPLACE("metadataURL", ${prefix}, '/assets')`})
      .where('metadataURL', 'like', `${prefix}/%`)
      .execute()
  ])
}

export async function down(db: Kysely<any>): Promise<void> {}
