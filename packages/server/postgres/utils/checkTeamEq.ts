import Team from '../../database/types/Team'
import getTeamsById, {IGetTeamsByIdResult} from '../../postgres/queries/getTeamsById'
import getRethink from '../../database/rethinkDriver'
import lodash from 'lodash'
import {CustomResolver, checkTableEq} from './checkEqBase'

const namesAreEqual: CustomResolver = (rethinkName, pgName) =>
  lodash.isEqual(rethinkName, pgName) || rethinkName.slice(0, 100) === pgName

const alwaysDefinedFieldsCustomResolvers = {
  name: namesAreEqual,
  createdAt: undefined,
  isArchived: undefined,
  isPaid: undefined,
  tier: undefined,
  orgId: undefined,
  updatedAt: undefined
} as {
  [Property in keyof Partial<Team>]: CustomResolver | undefined
}

const maybeUndefinedFieldsDefaultValues = {
  jiraDimensionFields: [],
  lastMeetingType: 'retrospective'
} as {
  [Property in keyof Partial<Team>]: any
}

const getPairNeFields = (rethinkTeam: Team, pgTeam: IGetTeamsByIdResult): string[] => {
  const neFields = [] as string[]

  for (const [f, customResolver] of Object.entries(alwaysDefinedFieldsCustomResolvers)) {
    const [rethinkValue, pgValue] = [rethinkTeam[f], pgTeam[f]]
    if (!lodash.isEqualWith(rethinkValue, pgValue, customResolver)) {
      neFields.push(f)
    }
  }
  for (const [f, defaultValue] of Object.entries(maybeUndefinedFieldsDefaultValues)) {
    const [rethinkValue, pgValue] = [rethinkTeam[f], pgTeam[f]]
    if (!lodash.isUndefined(rethinkValue)) {
      if (!lodash.isEqual(rethinkValue, pgValue)) {
        neFields.push(f)
      }
    } else {
      if (!lodash.isEqual(pgValue, defaultValue)) {
        neFields.push(f)
      }
    }
  }

  return neFields
}

const checkTeamEq = async () => {
  const r = await getRethink()
  const rethinkQuery = r.table('Team').orderBy('updatedAt', {index: 'updatedAt'})
  const errors = await checkTableEq<Team, IGetTeamsByIdResult>(
    rethinkQuery,
    getTeamsById,
    getPairNeFields
  )
  return errors
}

export default checkTeamEq
