import {createYoga} from 'graphql-yoga'
import schema from '../server/graphql/public/rootSchema'
import type {Env} from './types'
import {WebSockets} from './WebSockets'

const yoga = createYoga({schema, graphqlEndpoint: '/'})
const handler: ExportedHandler<Env> = {
  async fetch(request, env, _context) {
    const baz = 1 as any
    const {method, headers, url} = request
    // if (method === 'OPTIONS') {
    //   return new Response(null, {
    //     status: 204,
    //     headers: {
    //       'Access-Control-Allow-Origin': '*',
    //       'Access-Control-Allow-Methods': 'POST',
    //       'Access-Control-Allow-Headers': 'Content-Type'
    //     }
    //   })
    // }
    console.log('got it')
    if (method !== 'POST') return new Response('POST only')
    const contentType = headers.get('content-type') || ''
    // if (!contentType.includes('application/json')) return new Response('JSON only')

    // return res
    const webSocketsUrl = new URL(url)
    webSocketsUrl.pathname = 'connect'
    const {webSockets} = env
    // only 1 DO for now
    // in the future, we'll break this out by org and/or geography
    const durableObjectId = webSockets.idFromName('highlander')
    const doWorker = env.webSockets.get(durableObjectId)
    doWorker.fetch(webSocketsUrl.toString(), request)
  }
}

export {handler, WebSockets}
