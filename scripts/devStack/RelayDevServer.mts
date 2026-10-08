import {rspack, type Watching} from '@rspack/core'
import fs from 'fs'
import {createRequire} from 'module'
import path from 'path'
import relayConfig from '../../relay.config.js'
import RelayPersistServer from '../RelayPersistServer.mts'
import externalizeNodeModules from '../webpack/utils/externalizeNodeModules.mts'
import getProjectRoot from '../webpack/utils/getProjectRoot.js'
import transformRules from '../webpack/utils/transformRules.js'
import ChildTask from './ChildTask.mts'
import type TaskLog from './TaskLog.mts'

// relay-compiler ships no types. What it exports is the path of the compiler binary
const relayCompilerPath: string = createRequire(import.meta.url)('relay-compiler')
const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const DEV_ROOT = path.join(PROJECT_ROOT, 'dev')
const SCHEMA_PATHS = [
  path.join(SERVER_ROOT, 'graphql/public/schema.graphql'),
  path.join(SERVER_ROOT, 'graphql/private/schema.graphql'),
  path.join(CLIENT_ROOT, 'clientSchema.graphql')
]

const readSchemas = () =>
  SCHEMA_PATHS.map((schemaPath) => {
    try {
      return fs.readFileSync(schemaPath, 'utf8')
    } catch {
      return ''
    }
  }).join('\n')

/*
  Keeps the relay artifacts & the printed GraphQL schema in sync with the source while developing
  - the schema printer is its own tiny bundle. rspack watches the typeDefs it imports & reprints the schema when they change
  - relay compiles in watch mode & persists its queries to a server that lives in this process
  - a schema change restarts the relay compiler, because it only reads the schema when it starts
*/
export default class RelayDevServer {
  log: TaskLog
  persistServer = new RelayPersistServer()
  schemas = readSchemas()
  compiler: ChildTask | null = null
  schemaWatching: Watching | null = null

  constructor({log}: {log: TaskLog}) {
    this.log = log
  }

  get compilerPid() {
    return this.compiler?.pid
  }

  // resolves when the artifacts can be imported: right away if a previous run left them behind, else after the first compile
  async start() {
    const hasArtifacts = fs.readdirSync(relayConfig.artifactDirectory).length > 0 && !!this.schemas
    await this.persistServer.ready
    const firstSchema = this.watchSchema()
    if (!hasArtifacts) await firstSchema
    const firstCompile = this.startCompiler()
    if (!hasArtifacts) await firstCompile
  }

  watchSchema() {
    const schemaPrinter = rspack({
      mode: 'development',
      devtool: false,
      stats: 'errors-warnings',
      target: 'node',
      node: {__dirname: false},
      entry: {updateSchema: path.join(SERVER_ROOT, 'utils/updateGQLSchema.ts')},
      output: {
        path: DEV_ROOT,
        filename: '[name].js',
        library: {type: 'commonjs2'}
      },
      resolve: {
        alias: {'~': CLIENT_ROOT, 'parabol-server': SERVER_ROOT, 'parabol-client': CLIENT_ROOT},
        extensions: ['.js', '.json', '.ts', '.tsx']
      },
      externals: [externalizeNodeModules],
      plugins: [new rspack.DefinePlugin({__PRODUCTION__: false})],
      module: {rules: transformRules(PROJECT_ROOT, {builtin: true})}
    })
    return new Promise<void>((resolve) => {
      this.schemaWatching = schemaPrinter.watch({aggregateTimeout: 50}, async (error, stats) => {
        if (error || !stats || stats.hasErrors()) {
          this.log.line(stats ? stats.toString('errors-only') : String(error))
          return
        }
        await this.printSchema()
        resolve()
      })
    })
  }

  // The printer runs in a child so that every run loads the fresh bundle
  printSchema() {
    return new Promise<void>((resolve) => {
      const printer = new ChildTask({
        command: process.execPath,
        args: [
          '-e',
          `require(${JSON.stringify(path.join(DEV_ROOT, 'updateSchema.js'))}).default()`
        ],
        cwd: PROJECT_ROOT,
        log: this.log,
        onExit: () => {
          const schemas = readSchemas()
          const isChanged = schemas !== this.schemas
          this.schemas = schemas
          if (isChanged) {
            this.log.line('GraphQL schema updated')
            if (this.compiler) this.startCompiler()
          }
          resolve()
        }
      })
      printer.start()
    })
  }

  startCompiler() {
    return new Promise<void>((resolve) => {
      this.log.onLine((line) => {
        if (line.includes('Compilation completed')) resolve()
      })
      if (this.compiler) {
        this.compiler.restart()
        return
      }
      this.compiler = new ChildTask({
        command: relayCompilerPath,
        args: ['--watch'],
        cwd: PROJECT_ROOT,
        env: {RELAY_PERSIST_PORT: String(this.persistServer.port)},
        log: this.log
      })
      this.compiler.start()
    })
  }

  async stop() {
    this.persistServer.close()
    await this.compiler?.stop()
    const {schemaWatching} = this
    if (schemaWatching) await new Promise<void>((resolve) => schemaWatching.close(resolve))
  }

  killNow() {
    this.compiler?.killNow()
  }
}
