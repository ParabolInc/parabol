/*
 * Adjust the scheduledEndTime to (roughly) match the client clock
 * Assumes a fixed value for LATENCY
 */

import {RecordProxy} from 'relay-runtime'
import {Handler} from 'relay-runtime/lib/store/RelayStoreTypes'
import initHandler from './initHandler'

const LATENCY = 200 // ms to travel from server to client

const setClientClockOffset = (
  viewer: RecordProxy,
  scheduledEndTime: number,
  timeRemaining: number
) => {
  const serverTime = scheduledEndTime - timeRemaining + LATENCY
  const clientTime = Date.now()
  const clientClockOffset = clientTime - serverTime
  viewer.setValue(clientClockOffset, 'clientClockOffset')
  return clientClockOffset
}

const LocalTimeHandler: Handler = {
  update(store, payload) {
    initHandler(store, payload)
    const record = store.get(payload.dataID)
    const viewer = store.getRoot().getLinkedRecord('viewer')
    if (!record || !viewer) return
    const scheduledEndTimeStr = record.getValue(payload.fieldKey) as string | null
    const timeRemaining = record.getValue('timeRemaining') as number
    if (!scheduledEndTimeStr || !timeRemaining) {
      record.setValue(null, 'localScheduledEndTime')
      return
    }
    const scheduledEndTime = new Date(scheduledEndTimeStr).getTime()
    const clientClockOffset =
      (viewer.getValue('clientClockOffset') as number) ||
      setClientClockOffset(viewer, scheduledEndTime, timeRemaining)
    const localScheduledEndTime = scheduledEndTime + clientClockOffset
    const localScheduledEndTimeStr = new Date(localScheduledEndTime).toJSON()
    record.setValue(localScheduledEndTimeStr, 'localScheduledEndTime')
  }
}

export default LocalTimeHandler
