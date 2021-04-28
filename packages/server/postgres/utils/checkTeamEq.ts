import Team from '../../database/types/Team'
import getRethink from '../../database/rethinkDriver'
import {checkTableEq} from './checkEqBase'
import updateTeamByTeamId from '../queries/updateTeamByTeamId'

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
    'Team',
    rethinkQuery,
    updateTeamByTeamId,
    alwaysDefinedFields,
    maybeUndefinedFieldsDefaultValues,
    maxErrors
  )
  return errors
}

export default checkTeamEq
