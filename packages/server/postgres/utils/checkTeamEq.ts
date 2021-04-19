import Team from '../../database/types/Team'
import getTeamsById, {IGetTeamsByIdResult} from '../../postgres/queries/getTeamsById'
import getRethink from '../../database/rethinkDriver'
import lodash from 'lodash'
import {
  CustomResolver,
  checkTableEq,
  AlwaysDefinedFieldsCustomResolvers,
  MaybeUndefinedFieldsCustomResolversDefaultValues
} from './checkEqBase'

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
} as AlwaysDefinedFieldsCustomResolvers<Team>

const maybeUndefinedFieldsCustomResolversDefaultValues = {
  jiraDimensionFields: [undefined, []],
  lastMeetingType: [undefined, 'retrospective']
} as MaybeUndefinedFieldsCustomResolversDefaultValues<Team>

const checkTeamEq = async (pageSize = 3000, startPage = 0) => {
  const r = await getRethink()
  const rethinkQuery = r.table('Team').orderBy('updatedAt', {index: 'updatedAt'})
  const errors = await checkTableEq<Team, IGetTeamsByIdResult>(
    rethinkQuery,
    getTeamsById,
    alwaysDefinedFieldsCustomResolvers,
    maybeUndefinedFieldsCustomResolversDefaultValues,
    pageSize,
    startPage
  )
  return errors
}

export default checkTeamEq
