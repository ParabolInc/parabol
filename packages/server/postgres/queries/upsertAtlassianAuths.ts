import getKysely from '../getKysely'

const upsertAtlassianAuths = async (
  auths: {
    accessToken: string
    refreshToken: string
    cloudIds: string[]
    scope: string
    accountId: string
    teamId: string
    userId: string
  }[]
) => {
  await getKysely()
    .insertInto('AtlassianAuth')
    .values(auths)
    .onConflict((oc) =>
      oc.columns(['userId', 'teamId']).doUpdateSet((eb) => ({
        isActive: true,
        accessToken: eb.ref('excluded.accessToken'),
        refreshToken: eb.ref('excluded.refreshToken'),
        cloudIds: eb.ref('excluded.cloudIds'),
        scope: eb.ref('excluded.scope'),
        accountId: eb.ref('excluded.accountId'),
        teamId: eb.ref('excluded.teamId'),
        userId: eb.ref('excluded.userId')
      }))
    )
    .execute()
}
export default upsertAtlassianAuths
