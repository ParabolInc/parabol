import getKysely from '../../../../postgres/getKysely'

export default async function oauthProviders(organization: {id: string}) {
  const pg = getKysely()
  return await pg
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('organizationId', '=', organization.id)
    .orderBy('createdAt', 'desc')
    .execute()
}
