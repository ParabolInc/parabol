import Team from '../../database/types/Team'
import getTeamsById from '../../postgres/queries/getTeamsById'
import getRethink from '../../database/rethinkDriver'
import {checkTableEq} from './checkEqBase'

const alwaysDefinedFields: 
  (keyof Partial<Team>)[] = 
[
  'name',
  'createdAt',
  'isArchived',
  'isPaid',
  'tier',
  'orgId',
  'updatedAt',
]

const maybeUndefinedFieldsDefaultValues :
  {[Property in keyof Partial<Team>]: any} =
{
  jiraDimensionFields: [],
  lastMeetingType: 'retrospective',
}

const checkTeamEq = async (maxErrors: number = 10) => {
  const r = await getRethink()
  const rethinkQuery = r
    .table('Team').orderBy('updatedAt', {index: 'updatedAt'})
  const errors = await checkTableEq(
    rethinkQuery,
    getTeamsById,
    alwaysDefinedFields,
    maybeUndefinedFieldsDefaultValues,
    maxErrors
  )
  return errors
}

export default checkTeamEq
