import {QueryResolvers} from '../resolvers/types'

export interface PingPayload {}

const ping: QueryResolvers['ping'] = (source) => source

export default ping
