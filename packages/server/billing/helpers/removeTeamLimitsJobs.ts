import {r} from 'rethinkdb-ts'
import {RValue} from '../../database/stricterR'

const removeTeamLimitsJobs = async (orgId: string) => {
  const removeJobTypes = ['LOCK_ORGANIZATION', 'WARN_ORGANIZATION']
  return r
    .table('ScheduledJob')
    .filter((row: RValue) => {
      return row('orgId')
        .eq(orgId)
        .and(r.expr(removeJobTypes).contains(row('type')))
    })
    .delete()
    .run()
}

export default removeTeamLimitsJobs
