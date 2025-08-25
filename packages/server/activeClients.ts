import type {WebSocket} from 'uWebSockets.js'

export const activeClients = new Map<string, WebSocket<unknown>>()
