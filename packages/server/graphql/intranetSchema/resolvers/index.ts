import {Resolvers} from './types'
import ping from './ping'

const resolverMap: Resolvers = {
  Query: {
    ping
  }
}

export default resolverMap
