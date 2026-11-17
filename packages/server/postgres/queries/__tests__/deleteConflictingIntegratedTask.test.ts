import getKysely from '../../getKysely'
import deleteConflictingIntegratedTask from '../deleteConflictingIntegratedTask'

const pg = getKysely()
const suffix = `dcit-${Date.now()}`
const userId = `user-${suffix}`
const orgId = `org-${suffix}`
const sourceTeamId = `source-${suffix}`
const targetTeamId = `target-${suffix}`
const integrationHash = `github:jordanh/repo:${suffix}`
const sourceTaskId = `task-source-${suffix}`
const targetTaskId = `task-target-${suffix}`

const makeTask = (id: string, teamId: string) => ({
  id,
  teamId,
  createdBy: userId,
  content: JSON.stringify({type: 'doc', content: []}),
  plaintextContent: id,
  integrationHash
})

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Conflicting Task Tester'
    })
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Conflicting Task Org'}).execute()
  await pg
    .insertInto('Team')
    .values([
      {id: sourceTeamId, name: 'Source Team', orgId},
      {id: targetTeamId, name: 'Target Team', orgId}
    ])
    .execute()
  await pg
    .insertInto('Task')
    .values([makeTask(sourceTaskId, sourceTeamId), makeTask(targetTaskId, targetTeamId)])
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Task').where('id', 'in', [sourceTaskId, targetTaskId]).execute()
  await pg.deleteFrom('Team').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.destroy()
})

describe('deleteConflictingIntegratedTask', () => {
  it('deletes only the target team task sharing the integration hash and returns its id', async () => {
    const deleted = await deleteConflictingIntegratedTask({teamId: targetTeamId, integrationHash})

    const remaining = await pg
      .selectFrom('Task')
      .select('id')
      .where('integrationHash', '=', integrationHash)
      .execute()
    expect(deleted?.id).toBe(targetTaskId)
    expect(remaining.map(({id}) => id)).toEqual([sourceTaskId])
  })

  it('returns undefined when the target team has no conflicting task', async () => {
    const deleted = await deleteConflictingIntegratedTask({teamId: targetTeamId, integrationHash})
    expect(deleted).toBeUndefined()
  })

  it('participates in the caller transaction so a rollback restores the task', async () => {
    await pg.insertInto('Task').values(makeTask(targetTaskId, targetTeamId)).execute()

    await expect(
      pg.transaction().execute(async (trx) => {
        const deleted = await deleteConflictingIntegratedTask(
          {teamId: targetTeamId, integrationHash},
          trx
        )
        expect(deleted?.id).toBe(targetTaskId)
        throw new Error('rollback')
      })
    ).rejects.toThrow('rollback')

    const survivor = await pg
      .selectFrom('Task')
      .select('id')
      .where('id', '=', targetTaskId)
      .executeTakeFirst()
    expect(survivor?.id).toBe(targetTaskId)
  })
})
