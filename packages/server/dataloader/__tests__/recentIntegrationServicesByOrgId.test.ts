import ms from 'ms'
import {createPGTables, truncatePGTables} from '../../__tests__/common'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {getNewDataLoader} from '../getNewDataLoader'

const TEST_DB = 'recentIntegrationServicesTest'
const TABLES = ['Organization', 'Team', 'Task']
const ORG_ID = 'org1'
const OTHER_ORG_ID = 'org2'

const daysAgo = (days: number) => new Date(Date.now() - days * ms('1d'))

describe('recentIntegrationServicesByOrgId', () => {
  const pg = getKysely(TEST_DB)

  const addOrg = (id: string) =>
    pg.insertInto('Organization').values({id, name: id, tier: 'team'}).execute()

  const addTeam = (id: string, orgId: string, isArchived = false) =>
    pg.insertInto('Team').values({id, name: id, orgId, isArchived}).execute()

  const addTask = (teamId: string, service: string | null, createdDaysAgo = 1) => {
    const date = daysAgo(createdDaysAgo)
    return pg
      .insertInto('Task')
      .values({
        id: generateUID(),
        content: '{}',
        createdBy: 'user1',
        plaintextContent: '',
        teamId,
        createdAt: date,
        updatedAt: new Date(),
        integration: service ? JSON.stringify({service}) : null
      })
      .execute()
  }

  const loadServices = async (orgId: string) => {
    const dataLoader = getNewDataLoader('recentIntegrationServicesTest')
    try {
      return await dataLoader.get('recentIntegrationServicesByOrgId').load(orgId)
    } finally {
      dataLoader.dispose()
    }
  }

  beforeAll(async () => {
    await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
    await createPGTables(...TABLES)
  })

  beforeEach(async () => {
    await truncatePGTables(...TABLES)
    await addOrg(ORG_ID)
    await addOrg(OTHER_ORG_ID)
    await addTeam('team1', ORG_ID)
    await addTeam('team2', ORG_ID)
    await addTeam('otherTeam', OTHER_ORG_ID)
  })

  afterAll(async () => {
    await pg.schema.dropSchema(TEST_DB).cascade().execute()
    await pg.destroy()
  })

  it('ranks services by their linked tasks across the teams of an organization', async () => {
    await addTask('team1', 'linear')
    await addTask('team1', 'jira')
    await addTask('team2', 'jira')
    await addTask('team2', 'github')
    await addTask('team2', 'github')
    await addTask('team2', 'github')
    expect(await loadServices(ORG_ID)).toEqual(['github', 'jira', 'linear'])
  })

  it('orders services with as many linked tasks by name', async () => {
    await addTask('team1', 'gitlab')
    await addTask('team2', 'azureDevOps')
    expect(await loadServices(ORG_ID)).toEqual(['azureDevOps', 'gitlab'])
  })

  it('leaves out other organizations and archived teams', async () => {
    await addTeam('archivedTeam', ORG_ID, true)
    await addTask('team1', 'jira')
    await addTask('otherTeam', 'linear')
    await addTask('archivedTeam', 'gitlab')
    expect(await loadServices(ORG_ID)).toEqual(['jira'])
  })

  it('leaves out tasks created before the window, even if updated since', async () => {
    await addTask('team1', 'jira', 179)
    await addTask('team1', 'github', 181)
    expect(await loadServices(ORG_ID)).toEqual(['jira'])
  })

  it('leaves out tasks with no integration and is empty with no usage', async () => {
    await addTask('team1', null)
    expect(await loadServices(ORG_ID)).toEqual([])
  })

  it('leaves out tasks whose integration is a JSON null', async () => {
    await addTask('team1', 'jira')
    await pg
      .insertInto('Task')
      .values({
        id: generateUID(),
        content: '{}',
        createdBy: 'user1',
        plaintextContent: '',
        teamId: 'team1',
        integration: JSON.stringify(null)
      })
      .execute()
    expect(await loadServices(ORG_ID)).toEqual(['jira'])
  })
})
