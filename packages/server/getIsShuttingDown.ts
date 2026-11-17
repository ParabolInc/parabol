let isShuttingDown = false
export const getIsShuttingDown = () => isShuttingDown
export const setIsShuttingDown = () => {
  isShuttingDown = true
}

// A server that is shutting down takes new sockets until the load balancer stops sending them, then turns them away
let isRefusingSockets = false
export const getIsRefusingSockets = () => isRefusingSockets
export const setIsRefusingSockets = () => {
  isRefusingSockets = true
}
