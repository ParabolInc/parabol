import type {Agent as HttpAgent} from 'http'
import type {Agent as HttpsAgent} from 'https'

// The server runs @whatwg-node/fetch's Node ponyfill (see monkeyPatches.ts), which accepts a Node
// agent per request (RequestPonyfillInit in @whatwg-node/node-fetch) and only takes the node:http
// path when one is given. The DOM lib's RequestInit doesn't know about it, so declare it here
// rather than casting at the call site.
declare global {
  interface RequestInit {
    agent?: HttpAgent | HttpsAgent | false
  }
}
