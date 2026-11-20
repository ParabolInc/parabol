import {randomUUIDv7} from 'crypto'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const REPORTS_ORGANIZATION = `
  query ReportsOrganization {
    viewer {
      reportsOrganization {
        id
      }
    }
  }
`

const MARK_REPORTS_VIEWED = `
  mutation MarkReportsViewed($orgId: ID!) {
    markReportsViewed(orgId: $orgId) {
      user {
        reportsOrganization {
          id
        }
      }
    }
  }
`

const joinOrg = (orgId: string, userId: string) =>
  getKysely().insertInto('OrganizationUser').values({id: randomUUIDv7(), orgId, userId}).execute()

const reportsOrgIdOf = async (cookie: string) => {
  const res = await sendPublic({query: REPORTS_ORGANIZATION, cookie})
  return (res.data.viewer.reportsOrganization?.id ?? null) as string | null
}

const markViewed = (orgId: string, cookie: string) =>
  sendPublic({query: MARK_REPORTS_VIEWED, variables: {orgId}, cookie})

test('Reports opens to the org whose reports the viewer opened last', async () => {
  const viewer = await signUp()
  const other = await signUp()
  await joinOrg(other.orgId, viewer.userId)
  expect(await reportsOrgIdOf(viewer.cookie)).toBeNull()

  const res = await markViewed(other.orgId, viewer.cookie)
  expect(res.errors).toBeUndefined()
  expect(res.data.markReportsViewed.user.reportsOrganization.id).toBe(other.orgId)

  await markViewed(viewer.orgId, viewer.cookie)
  expect(await reportsOrgIdOf(viewer.cookie)).toBe(viewer.orgId)
})

test('an org the viewer left is forgotten', async () => {
  const viewer = await signUp()
  const other = await signUp()
  await joinOrg(other.orgId, viewer.userId)
  await markViewed(viewer.orgId, viewer.cookie)
  await markViewed(other.orgId, viewer.cookie)
  await getKysely()
    .updateTable('OrganizationUser')
    .set({removedAt: new Date()})
    .where('orgId', '=', other.orgId)
    .where('userId', '=', viewer.userId)
    .execute()
  expect(await reportsOrgIdOf(viewer.cookie)).toBe(viewer.orgId)
})

test('only members can mark an org’s reports viewed', async () => {
  const viewer = await signUp()
  const outsider = await signUp()
  const res = await markViewed(viewer.orgId, outsider.cookie)
  expect(res.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  expect(await reportsOrgIdOf(outsider.cookie)).toBeNull()
})
