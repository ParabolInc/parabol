import {Updateable} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {DB} from '../../../postgres/types/pg'

type FilterType = Omit<Updateable<DB['ScheduledJob']>, 'runAt'>

const removeScheduledJobs = async (runAt: Date, filter?: FilterType) => {
  const pg = getKysely()
  let query = pg.deleteFrom('ScheduledJob').where('runAt', '=', runAt)
  if (filter) {
    Object.keys(filter).forEach((key) => {
      const value = filter[key as keyof FilterType]
      if (value) query = query.where(key as keyof FilterType, '=', value)
    })
  }
  return query.execute()
}

export default removeScheduledJobs
