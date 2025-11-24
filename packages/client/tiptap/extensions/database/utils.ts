import ms from 'ms'
import * as Y from 'yjs'

const timeStampTolerance = ms('10s')

export const updateChangedAt = (row: Y.Map<any>, event: 'created' | 'updated', userId: string) => {
  const now = Date.now()
  const currentAt = row.get(`_${event}At`)
  console.log('GEORG typeof currentAt', typeof currentAt)
  const currentBy = row.get(`_${event}By`)
  if (currentBy !== userId || !currentAt || Math.abs(currentAt - now) > timeStampTolerance) {
    console.log(`GEORG set ${event}`, {
      currentBy,
      userId,
      currentAt,
      now,
      diff: currentAt ? Math.abs(currentAt - now) : 'n/a',
      threshold: timeStampTolerance
    })
    row.set(`_${event}At`, now)
    row.set(`_${event}By`, userId)
  }
}
