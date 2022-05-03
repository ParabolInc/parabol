import getRethink from '../../database/rethinkDriver'
import Team from '../../database/types/Team'
import getTeamsByIds from '../queries/getTeamsByIds'
import {checkTableEq} from './checkEqBase'

const alwaysDefinedFields: (keyof Partial<Team>)[] = [
  'name',
  'createdAt',
  'isArchived',
  'isPaid',
  'tier',
  'orgId'
]

const maybeUndefinedFieldsDefaultValues: {[Property in keyof Partial<Team>]: any} = {
  jiraDimensionFields: [],
  lastMeetingType: 'retrospective'
}

const checkTeamEq = async (maxErrors = 10) => {
  const r = await getRethink()
  const rethinkQuery = r.table('Team').orderBy('updatedAt', {index: 'updatedAt'})
  const errors = await checkTableEq(
    'Team',
    rethinkQuery,
    getTeamsByIds,
    alwaysDefinedFields,
    maybeUndefinedFieldsDefaultValues,
    {},
    maxErrors
  )
  return errors
}

export default checkTeamEq
