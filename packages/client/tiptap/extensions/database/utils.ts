import ms from 'ms'
import * as Y from 'yjs'

const timeStampTolerance = ms('10s')

export const updateChangedAt = (row: Y.Map<any>, event: 'created' | 'updated', userId: string) => {
  const now = Date.now()
  let currentAt = row.get(`_${event}At`)
  if (typeof currentAt !== 'number') {
    currentAt = null
  }
  const currentBy = row.get(`_${event}By`)
  if (currentBy !== userId || !currentAt || Math.abs(currentAt - now) > timeStampTolerance) {
    row.set(`_${event}At`, now)
    row.set(`_${event}By`, userId)
  }
}
