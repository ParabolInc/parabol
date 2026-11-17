import type {WebSocket} from 'uWebSockets.js'
import type {Extra} from 'graphql-ws/use/uWebSockets'
import type {HocusPocusSocketData} from './hocusPocusHandler'

export const activeClients = new Map<string, Extra>()
export const activeYjsSockets = new Set<WebSocket<HocusPocusSocketData>>()
