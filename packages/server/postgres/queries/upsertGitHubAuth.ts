import getKysely from '../getKysely'

const upsertGitHubAuth = async (auth: {
  accessToken: string
  login: string
  teamId: string
  userId: string
  scope: string
}) => {
  await getKysely()
    .insertInto('GitHubAuth')
    .values(auth)
    .onConflict((oc) =>
      oc.columns(['userId', 'teamId']).doUpdateSet((eb) => ({
        accessToken: eb.ref('excluded.accessToken'),
        isActive: true,
        login: eb.ref('excluded.login'),
        scope: eb.ref('excluded.scope')
      }))
    )
    .execute()
}
export default upsertGitHubAuth
