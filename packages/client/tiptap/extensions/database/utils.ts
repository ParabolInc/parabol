import ms from 'ms'
import {YKeyValue} from 'y-utility/y-keyvalue'
import * as Y from 'yjs'
import {RawCell} from './data'

const timeStampTolerance = ms('10s')

export const updateChangedAt = (
  rowArray: Y.Array<RawCell>,
  event: 'created' | 'updated',
  userId: string
) => {
  const row = new YKeyValue(rowArray)
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
