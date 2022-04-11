import {closeRethink} from '../database/rethinkDriver'

async function teardown() {
  await closeRethink()
}

export default teardown
