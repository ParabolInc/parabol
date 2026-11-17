import {Logger} from './Logger'

// Node prints warnings to stderr as plain text, which GKE files as ERROR. Its printer is the only default listener
const logProcessWarnings = () => {
  process.removeAllListeners('warning')
  process.on('warning', (warning) => {
    Logger.warn(warning)
  })
}

export default logProcessWarnings
