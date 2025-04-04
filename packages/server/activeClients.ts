import type {Extra} from 'graphql-ws/use/uWebSockets'

export const activeClients = new Map<string, Extra>()
