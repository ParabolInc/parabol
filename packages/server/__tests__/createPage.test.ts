import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

test('createPage blocks creating a team page for a team the viewer is not a member of', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])
  const pg = getKysely()

  const before = await pg
    .selectFrom('Page')
    .select('id')
    .where('teamId', '=', victim.teamId)
    .where('userId', '=', attacker.userId)
    .execute()

  const createPageRes = await sendPublic({
    query: `
      mutation CreatePage($teamId: ID!) {
        createPage(teamId: $teamId) {
          ... on CreatePagePayload {
            page {
              id
            }
          }
        }
      }
    `,
    variables: {
      teamId: victim.teamId
    },
    cookie: attacker.cookie
  })

  const after = await pg
    .selectFrom('Page')
    .select('id')
    .where('teamId', '=', victim.teamId)
    .where('userId', '=', attacker.userId)
    .execute()

  expect(after.length).toBe(before.length)
  expect(createPageRes.data).toBeNull()
  expect(createPageRes.errors?.[0].message).toMatch(
    /Not Authorised|Not Authorized|Unexpected Error/i
  )
})
