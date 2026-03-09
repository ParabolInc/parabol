import ms from 'ms'
import {type RowDataMap} from './data'

const timeStampTolerance = ms('10s')

export const updateChangedAt = (row: RowDataMap, event: 'created' | 'updated', userId: string) => {
  const now = Date.now()
  let currentAt = row.get(`_${event}At`)
  if (typeof currentAt !== 'number') {
    currentAt = null
  }
  const currentBy = row.get(`_${event}By`)
  if (currentBy !== userId || !currentAt || Math.abs(currentAt - now) > timeStampTolerance) {
    row.set(`_${event}At`, now as any)
    row.set(`_${event}By`, userId)
  }
}
