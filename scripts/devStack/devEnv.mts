import {createRequire} from 'module'
import os from 'os'
import getProjectRoot from '../webpack/utils/getProjectRoot.js'
import ensureEnvFile from './ensureEnvFile.mts'

// Sets up process.env for the dev stack as a side effect. .env can only be loaded once it exists
ensureEnvFile(getProjectRoot())
createRequire(import.meta.url)('../webpack/utils/dotenv.js')
process.env.NODE_ENV ||= 'development'
// rspack takes every core by default, which slows down the server while it boots next to the client build
// The client build is bound by its JS loaders, so it is just as fast with half of the cores
const buildThreads = String(Math.max(2, Math.floor(os.availableParallelism() / 2)))
process.env.TOKIO_WORKER_THREADS ||= buildThreads
process.env.RAYON_NUM_THREADS ||= buildThreads
