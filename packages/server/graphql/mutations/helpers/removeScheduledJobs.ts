import getRethink from '../../../database/rethinkDriver'

const removeScheduledJobs = (runAt: Date, filter: {[key: string]: any}) => {
  const r = getRethink()
  return r
    .table('ScheduledJob')
    .getAll(runAt, {index: 'runAt'})
    .filter(filter)
    .delete()
}

export default removeScheduledJobs
