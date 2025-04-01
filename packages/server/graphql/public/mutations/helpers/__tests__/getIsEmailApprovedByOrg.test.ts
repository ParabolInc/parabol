import '../../../../../../../scripts/webpack/utils/dotenv'
import {createPGTables, truncatePGTables} from '../../../../../__tests__/common'
import getKysely from '../../../../../postgres/getKysely'
import {getNewDataLoader} from '../../../../getDataLoader'
import getIsEmailApprovedByOrg from '../getIsEmailApprovedByOrg'

const TEST_DB = 'getIsEmailApprovedByOrgTest'

beforeAll(async () => {
  const pg = getKysely(TEST_DB)
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
  await createPGTables('User', 'Organization', 'OrganizationApprovedDomain')

  const user = {
    id: 'testUserId',
    email: 'test-user@example.com',
    preferredName: 'testUser',
    picture: ''
  }
  const org = {
    id: 'testOrgId',
    name: 'testOrgName'
  }
  const approvedDomains = ['test.com', 'sub.subtest.com', '*.wildtest.com']
  await pg
    .with('User', (qc) => qc.insertInto('User').values(user))
    .with('Organization', (qc) => qc.insertInto('Organization').values(org))
    .insertInto('OrganizationApprovedDomain')
    .values(approvedDomains.map((domain) => ({orgId: org.id, addedByUserId: user.id, domain})))
    .execute()
})

afterAll(async () => {
  await truncatePGTables('User', 'Organization', 'OrganizationApprovedDomain')
  await getKysely().destroy()
})

test.each([
  'foo@bar.com',
  'foo@test.cc',
  'foo@abc-test.com',
  'test.com@other.com',
  'foo@other.subtest.com',
  'foo@notwildtest.com'
])('Unapproved email fails: %s', async (email) => {
  const dataloader = getNewDataLoader()
  const error = await getIsEmailApprovedByOrg(email, 'testOrgId', dataloader)
  expect(error).toBeInstanceOf(Error)
})

test.each(['foo@test.com', 'foo@sub.subtest.com', 'foo@wildtest.com', 'foo@sub.wildtest.com'])(
  'Approved email passes: %s',
  async (email) => {
    const dataloader = getNewDataLoader()
    const error = await getIsEmailApprovedByOrg(email, 'testOrgId', dataloader)
    expect(error).toBe(undefined)
  }
)
