import pickReportsOrg from '../pickReportsOrg'

const starterOld = {id: 'starterOld', tier: 'starter', createdAt: '2020-01-01T00:00:00Z'} as const
const teamNew = {id: 'teamNew', tier: 'team', createdAt: '2024-01-01T00:00:00Z'} as const
const teamOld = {id: 'teamOld', tier: 'team', createdAt: '2022-01-01T00:00:00Z'} as const
const organizations = [starterOld, teamNew, teamOld]

test('opens the org the viewer looked at last', () => {
  expect(pickReportsOrg(organizations, 'starterOld')).toBe(starterOld)
})

test('without a stored org, picks the highest tier, then the oldest', () => {
  expect(pickReportsOrg(organizations, null)).toBe(teamOld)
})

test('ignores a stored org the viewer is no longer on', () => {
  expect(pickReportsOrg(organizations, 'leftOrg')).toBe(teamOld)
})

test('returns nothing when the viewer has no orgs', () => {
  expect(pickReportsOrg([], 'starterOld')).toBeUndefined()
})
