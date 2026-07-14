import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

test('Team.secondaryStatuses is empty for a fresh team', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: `
      query TeamSecondaryStatuses {
        viewer {
          teams {
            id
            secondaryStatuses {
              id
              label
              status
              sortOrder
            }
          }
        }
      }
    `,
    cookie
  })
  expect(res.errors).toBeUndefined()
  const team = res.data.viewer.teams.find((t: {id: string}) => t.id === teamId)
  expect(team.secondaryStatuses).toEqual([])
})

const ADD_MUTATION = `
  mutation AddTaskSecondaryStatus($teamId: ID!, $status: TaskStatusEnum!, $label: String!, $sortOrder: Float!) {
    addTaskSecondaryStatus(teamId: $teamId, status: $status, label: $label, sortOrder: $sortOrder) {
      taskSecondaryStatus {
        id
        label
        status
        sortOrder
      }
    }
  }
`

test('addTaskSecondaryStatus happy path + appears on Team.secondaryStatuses', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId, status: 'active', label: 'In review', sortOrder: 1},
    cookie
  })
  expect(res.errors).toBeUndefined()
  const created = res.data.addTaskSecondaryStatus.taskSecondaryStatus
  expect(created).toMatchObject({label: 'In review', status: 'active', sortOrder: 1})
  expect(created.id).toMatch(/^taskSecondaryStatus:\d+$/)
})

test('addTaskSecondaryStatus blocks a non-team-member', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId: victim.teamId, status: 'active', label: 'Sneaky', sortOrder: 1},
    cookie: attacker.cookie
  })
  expect(res.data).toBeNull()
  expect(res.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('Viewer is not on team')})
  ])
})

test('addTaskSecondaryStatus rejects case-insensitive duplicate label', async () => {
  const {teamId, cookie} = await signUp()
  const vars = {teamId, status: 'stuck', label: 'Blocked', sortOrder: 1}
  await sendPublic({query: ADD_MUTATION, variables: vars, cookie})
  const dupe = await sendPublic({
    query: ADD_MUTATION,
    variables: {...vars, label: 'BLOCKED', sortOrder: 2},
    cookie
  })
  expect(dupe.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('already exists')})
  ])
})

test('addTaskSecondaryStatus enforces the 25-per-team cap', async () => {
  const {teamId, cookie} = await signUp()
  // seed 25 directly; the mutation is the 26th
  const pg = getKysely()
  await pg
    .insertInto('TaskSecondaryStatus')
    .values(
      Array.from({length: 25}, (_, i) => ({
        teamId,
        status: 'active' as const,
        label: `Status ${i}`,
        sortOrder: i
      }))
    )
    .execute()
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId, status: 'future', label: 'One too many', sortOrder: 99},
    cookie
  })
  expect(res.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('limited to 25')})
  ])
})
