import rethinkdbdash from 'rethinkdbdash'
import getRethinkConfig from './getRethinkConfig'

const config = getRethinkConfig()
let driver: any
const getRethink = () => {
  if (!driver) {
    driver = rethinkdbdash(config)
  }
  return driver
}

export default getRethink
