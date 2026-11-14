import {Logger} from '../Logger'

// Hocuspocus prints the connection limits it enforces with console.warn, which GKE files as ERROR without the socket's user or ip
const logHocuspocusWarnings = () => {
  const printWarning = console.warn
  let isLogging = false
  console.warn = (...args: unknown[]) => {
    const [message] = args
    if (isLogging || typeof message !== 'string' || !message.startsWith('Hocuspocus: ')) {
      printWarning(...args)
      return
    }
    isLogging = true
    try {
      Logger.warn(message)
    } finally {
      isLogging = false
    }
  }
}

export default logHocuspocusWarnings
