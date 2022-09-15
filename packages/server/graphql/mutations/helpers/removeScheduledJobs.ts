import getRethink from '../../../database/rethinkDriver'

const removeScheduledJobs = async (runAt: Date, filter: {[key: string]: any}) => {
  const r = await getRethink()
  return r.table('ScheduledJob').getAll(runAt, {index: 'runAt'}).filter(filter).delete().run()
}

export default removeScheduledJobs
