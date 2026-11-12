// How long a server that is shutting down takes to hand its sockets to the other servers
const reconnectWindow = process.env.WEB_SERVER_RECONNECT_WINDOW
  ? parseInt(process.env.WEB_SERVER_RECONNECT_WINDOW, 10) * 1000
  : 60_000

// Each phase gets a share of the window, so a shorter window, like staging's, shortens all of them
const loadBalancerDelay = Math.min(10_000, reconnectWindow / 6)
const maxWaitForIdle = reconnectWindow / 12
const maxWaitForYjsUnload = reconnectWindow / 12
const reconnectGrace = reconnectWindow / 12

const socketDrainSchedule = {
  reconnectWindow,
  // the load balancer keeps sending new sockets until /ready has failed twice, 3 seconds apart
  loadBalancerDelay,
  // how long a running query or mutation may hold up the close of its socket
  maxWaitForIdle,
  // how long Yjs gets to store the documents this server still holds and release them to the next one
  maxWaitForYjsUnload,
  // a user whose socket comes back within this long never shows as disconnected to their teammates
  reconnectGrace,
  // the rest of the window spreads the closes out, so the other servers aren't hit by every reconnect at once
  closeSpread: Math.max(
    0,
    reconnectWindow -
      loadBalancerDelay -
      maxWaitForIdle -
      maxWaitForYjsUnload -
      reconnectGrace -
      1000
  )
}

export default socketDrainSchedule
