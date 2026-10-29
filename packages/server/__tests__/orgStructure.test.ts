import {randomUUIDv7} from 'crypto'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const STRUCTURE = `
  structure {
    id
    name
    values {
      id
      name
      teams {
        id
      }
    }
  }
`

const ORG_STRUCTURE = `
  query OrgStructure($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        ${STRUCTURE}
      }
    }
  }
`

const SET_ORG_STRUCTURE = `
  mutation SetOrgStructure($orgId: ID!, $levels: [OrgStructureLevelInput!]!) {
    setOrgStructure(orgId: $orgId, levels: $levels) {
      organization {
        ${STRUCTURE}
      }
    }
  }
`

const PLACE_TEAM = `
  mutation PlaceTeam($teamId: ID!, $levelId: ID!, $valueId: ID) {
    placeTeam(teamId: $teamId, levelId: $levelId, valueId: $valueId) {
      organization {
        ${STRUCTURE}
      }
    }
  }
`

interface Level {
  id: string
  name: string
  values: {id: string; name: string; teams: {id: string}[]}[]
}

interface LevelInput {
  id?: string
  name: string
  values: {id?: string; name: string}[]
}

const UNITS_AND_REGIONS: LevelInput[] = [
  {name: 'Business unit', values: [{name: 'Platform'}, {name: 'Custody'}]},
  {name: 'Region', values: [{name: 'Americas'}]}
]

const signUpWithReports = async () => {
  const user = await signUp()
  await getKysely()
    .insertInto('FeatureFlagOwner')
    .values({featureName: 'Reports', orgId: user.orgId})
    .execute()
  return user
}

const setStructure = (orgId: string, cookie: string, levels: LevelInput[]) =>
  sendPublic({query: SET_ORG_STRUCTURE, variables: {orgId, levels}, cookie})

const levelsOf = (res: Awaited<ReturnType<typeof setStructure>>): Level[] =>
  res.data.setOrgStructure.organization.structure

const structureOf = async (orgId: string, cookie: string): Promise<Level[]> => {
  const res = await sendPublic({query: ORG_STRUCTURE, variables: {orgId}, cookie})
  return res.data.viewer.organization.structure
}

const toInput = ({id, name, values}: Level): LevelInput => ({
  id,
  name,
  values: values.map((value) => ({id: value.id, name: value.name}))
})

test('a leader sets levels and values, and renaming or reordering keeps their ids', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const created = await setStructure(orgId, cookie, UNITS_AND_REGIONS)
  expect(created.errors).toBeUndefined()
  const [unit, region] = levelsOf(created)
  const reordered = levelsOf(
    await setStructure(orgId, cookie, [
      toInput(region!),
      {...toInput(unit!), name: 'Division', values: [...toInput(unit!).values].reverse()}
    ])
  )
  expect(reordered.map(({id, name}) => [id, name])).toEqual([
    [region!.id, 'Region'],
    [unit!.id, 'Division']
  ])
  expect(reordered[1]!.values.map(({name}) => name)).toEqual(['Custody', 'Platform'])
})

test('a team is placed at a value, and removing the value leaves it not set', async () => {
  const {orgId, cookie, teamId} = await signUpWithReports()
  const [unit] = levelsOf(await setStructure(orgId, cookie, UNITS_AND_REGIONS))
  const [platform, custody] = unit!.values
  const placed = await sendPublic({
    query: PLACE_TEAM,
    variables: {teamId, levelId: unit!.id, valueId: platform!.id},
    cookie
  })
  expect(placed.errors).toBeUndefined()
  expect(placed.data.placeTeam.organization.structure[0].values[0].teams).toEqual([{id: teamId}])
  await setStructure(orgId, cookie, [{...toInput(unit!), values: [toInput(unit!).values[1]!]}])
  const [unitAfter] = await structureOf(orgId, cookie)
  expect(unitAfter!.values).toEqual([{id: custody!.id, name: 'Custody', teams: []}])
})

test('only org admins and billing leaders change the structure, and members only see placements on teams they can see', async () => {
  const owner = await signUpWithReports()
  const member = await signUp()
  await getKysely()
    .insertInto('OrganizationUser')
    .values({id: randomUUIDv7(), orgId: owner.orgId, userId: member.userId})
    .execute()
  const [unit] = levelsOf(await setStructure(owner.orgId, owner.cookie, UNITS_AND_REGIONS))
  const placeAs = (cookie: string) =>
    sendPublic({
      query: PLACE_TEAM,
      variables: {teamId: owner.teamId, levelId: unit!.id, valueId: unit!.values[0]!.id},
      cookie
    })
  expect((await placeAs(member.cookie)).errors).toBeTruthy()
  expect((await placeAs(owner.cookie)).errors).toBeUndefined()
  expect((await setStructure(owner.orgId, member.cookie, [])).errors).toBeTruthy()
  const [publicUnit] = await structureOf(owner.orgId, member.cookie)
  expect(publicUnit!.values[0]!.teams).toEqual([{id: owner.teamId}])
  await getKysely()
    .updateTable('Team')
    .set({isPublic: false})
    .where('id', '=', owner.teamId)
    .execute()
  const [privateUnit] = await structureOf(owner.orgId, member.cookie)
  expect(privateUnit!.values[0]!.teams).toEqual([])
})

test('every level and value needs a name of its own', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const twice = await setStructure(orgId, cookie, [
    {name: 'Region', values: []},
    {name: 'region', values: []}
  ])
  expect(twice.errors?.[0]?.message).toBe('Each level needs its own name')
  const blank = await setStructure(orgId, cookie, [{name: '  ', values: []}])
  expect(blank.errors?.[0]?.message).toMatch('A level needs a name')
  const valueTwice = await setStructure(orgId, cookie, [
    {name: 'Region', values: [{name: 'EMEA'}, {name: 'emea'}]}
  ])
  expect(valueTwice.errors?.[0]?.message).toBe('Each value of a level needs its own name')
})

test('an organization without Reports has no org structure', async () => {
  const {orgId, cookie} = await signUp()
  expect(await structureOf(orgId, cookie)).toEqual([])
})
