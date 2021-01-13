import dataFieldsToSerialize from '../__tests__/utils/dataFieldsToSerialize'
import * as getPubSub from '../utils/getPubSub'

const fieldsToSerialize = {
  invitation: [...dataFieldsToSerialize],
  newAuthToken: ['channelId', 'message.data.tms'],
  notification: [...dataFieldsToSerialize],
  organization: [...dataFieldsToSerialize],
  task: [...dataFieldsToSerialize],
  team: [...dataFieldsToSerialize],
  teamMember: [...dataFieldsToSerialize]
}

const untestablePayloads = ['message.data.removedRequestNotifications']

// const getPath = (str, obj) => str.split('.').reduce((o, i) => o[i], obj);
const replacePath = (str, docArr, newVal) => {
  docArr.forEach((obj) => {
    const path = str.split('.')
    let currentObj = obj
    for (let ii = 0; ii < path.length - 1; ii++) {
      const next = path[ii]
      currentObj = currentObj[next]
      if (!currentObj) return
    }
    const lastVal = path[path.length - 1]
    if (Array.isArray(currentObj[lastVal])) {
      currentObj[lastVal] = newVal
    }
  })
}

export default class MockPubSub {
  constructor () {
    getPubSub.default = () => this
    this.db = {}
  }

  __serialize (dynamicSerializer) {
    const channels = Object.keys(this.db).sort()
    const snapshot = {}
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i]
      const doc = this.db[channel]
      const channelFields = fieldsToSerialize[channel]
      if (!channelFields) {
        throw new Error(`BAD MOCK: No fieldsToSerialize for pubsub channel ${channel}`)
      }

      // some payloads can't be tested because they are an array that can't be sorted
      // for those, we can skip it here and use the arrayContaining test
      untestablePayloads.forEach((untestable) => {
        replacePath(untestable, doc, 'UNTESTED')
      })
      snapshot[channel] = dynamicSerializer.toStatic(doc, channelFields)
    }
    return snapshot
  }

  publish (channel, message) {
    const [channelName, channelId] = channel.split('.')
    this.db[channelName] = this.db[channelName] || []
    this.db[channelName].push({channelId, message})
  }
}
